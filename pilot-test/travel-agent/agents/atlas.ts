// Atlas Agent - Smart Budget Planner
export interface AtlasRequest {
  budget: number;
  allocations: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    shopping: number;
    emergency: number;
  };
}

export interface AtlasResponse {
  tracking: {
    totalSpent: number;
    remainingBudget: number;
    dailyAllowance: number;
    categorySpending: {
      flights: number;
      accommodation: number;
      food: number;
      activities: number;
      shopping: number;
    };
  };
  alerts: {
    type: 'info' | 'warning' | 'critical';
    message: string;
    threshold: number;
    current: number;
  }[];
}

// Initialize budget tracking
export function initializeBudget(request: AtlasRequest): AtlasResponse {
  console.log(`Atlas: Initializing budget tracking with $${request.budget}`);
  
  return {
    tracking: {
      totalSpent: 0,
      remainingBudget: request.budget,
      dailyAllowance: request.budget / 7, // Default 7-day trip
      categorySpending: {
        flights: 0,
        accommodation: 0,
        food: 0,
        activities: 0,
        shopping: 0
      }
    },
    alerts: []
  };
}

// Track spending and update budget
export function trackSpending(
  currentTracking: AtlasResponse,
  category: keyof AtlasResponse['tracking']['categorySpending'],
  amount: number,
  totalTripDays: number
): AtlasResponse {
  console.log(`Atlas: Tracking $${amount} spent on ${category}`);
  
  // Update category spending
  const updatedCategorySpending = {
    ...currentTracking.tracking.categorySpending,
    [category]: currentTracking.tracking.categorySpending[category] + amount
  };
  
  // Calculate total spent
  const totalSpent = Object.values(updatedCategorySpending).reduce((sum, value) => sum + value, 0);
  
  // Calculate remaining budget
  const remainingBudget = currentTracking.tracking.remainingBudget - amount;
  
  // Calculate daily allowance
  const dailyAllowance = remainingBudget / totalTripDays;
  
  // Create updated tracking object
  const updatedTracking = {
    ...currentTracking.tracking,
    totalSpent,
    remainingBudget,
    dailyAllowance,
    categorySpending: updatedCategorySpending
  };
  
  // Generate alerts based on spending patterns
  const alerts = generateBudgetAlerts(
    currentTracking.tracking.remainingBudget,
    updatedTracking,
    category,
    amount
  );
  
  return {
    tracking: updatedTracking,
    alerts
  };
}

// Generate budget alerts based on spending patterns
function generateBudgetAlerts(
  previousRemaining: number,
  currentTracking: any,
  category: string,
  amount: number
): AtlasResponse['alerts'] {
  const alerts: AtlasResponse['alerts'] = [];
  const totalBudget = currentTracking.totalSpent + currentTracking.remainingBudget;
  
  // Check if we've spent more than 80% of the budget
  const spentPercentage = currentTracking.totalSpent / totalBudget;
  if (spentPercentage > 0.8) {
    alerts.push({
      type: 'critical',
      message: `🚨 CRITICAL: You have spent ${(spentPercentage * 100).toFixed(1)}% of your budget!`,
      threshold: 0.8,
      current: spentPercentage
    });
  } else if (spentPercentage > 0.7) {
    alerts.push({
      type: 'warning',
      message: `⚠️ WARNING: You have spent ${(spentPercentage * 100).toFixed(1)}% of your budget.`,
      threshold: 0.7,
      current: spentPercentage
    });
  }
  
  // Check if we're overspending in a specific category
  const categoryPercentage = currentTracking.categorySpending[category as keyof typeof currentTracking.categorySpending] / totalBudget;
  if (categoryPercentage > 0.25) {
    alerts.push({
      type: 'warning',
      message: `⚠️ WARNING: You've spent ${(categoryPercentage * 100).toFixed(1)}% of your budget on ${category}.`,
      threshold: 0.25,
      current: categoryPercentage
    });
  }
  
  // Check if we're spending too much per day
  if (currentTracking.dailyAllowance < 0) {
    alerts.push({
      type: 'critical',
      message: `🚨 CRITICAL: You've exceeded your daily budget allowance!`,
      threshold: 0,
      current: currentTracking.dailyAllowance
    });
  }
  
  return alerts;
}

// Get budget recommendations
export function getBudgetRecommendations(tracking: AtlasResponse['tracking']): string[] {
  const recommendations: string[] = [];
  const totalBudget = tracking.totalSpent + tracking.remainingBudget;
  
  // Recommend adjustments based on category spending
  Object.entries(tracking.categorySpending).forEach(([category, spent]) => {
    const percentage = spent / totalBudget;
    if (percentage > 0.3) {
      recommendations.push(`Consider reducing spending on ${category} (${(percentage * 100).toFixed(1)}% of budget)`);
    }
  });
  
  // Recommend savings if under budget
  if (tracking.remainingBudget > totalBudget * 0.3) {
    recommendations.push(`You're under budget! Consider adding a special experience.`);
  }
  
  // Recommend daily budget management
  if (tracking.dailyAllowance < 50) {
    recommendations.push(`Your daily allowance is low ($${tracking.dailyAllowance.toFixed(2)}). Track every expense.`);
  }
  
  return recommendations;
}

// Predict future spending
export function predictFutureSpending(
  tracking: AtlasResponse['tracking'],
  daysRemaining: number
): { projectedTotal: number; willExceedBudget: boolean; recommendedDailyLimit: number } {
  const currentDailyAverage = tracking.totalSpent / (7 - daysRemaining); // Assuming 7-day trip
  const projectedRemaining = currentDailyAverage * daysRemaining;
  const projectedTotal = tracking.totalSpent + projectedRemaining;
  const willExceedBudget = projectedTotal > (tracking.totalSpent + tracking.remainingBudget);
  const recommendedDailyLimit = tracking.remainingBudget / daysRemaining;
  
  return {
    projectedTotal,
    willExceedBudget,
    recommendedDailyLimit
  };
}
