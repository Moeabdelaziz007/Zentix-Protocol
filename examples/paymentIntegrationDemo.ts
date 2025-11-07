/**
 * Example usage of Payment Service
 * This file demonstrates how to use the PayPal and Stripe integration service
 */

import { paymentService } from '../core/services/paymentService';

async function testPaymentIntegration() {
  console.log('💳 Testing Payment Integration');
  console.log('══════════════════════════════');
  
  // Check if PayPal is configured
  if (paymentService.isPayPalConfigured()) {
    console.log('✅ PayPal service is configured');
    console.log(`🔑 PayPal Client ID: ${paymentService.getMaskedPayPalClientId()}`);
    
    // Initialize PayPal client
    const paypalClient = await paymentService.initializePayPalClient('sandbox');
    if (paypalClient) {
      console.log('🔗 PayPal Client initialized successfully');
      
      // Create a test PayPal payment
      const payment = await paymentService.createPayPalPayment('100.00', 'USD', 'Test payment');
      if (payment) {
        console.log('💰 PayPal Payment created:', payment);
      }
    }
  } else {
    console.log('⚠️  PayPal service is not configured');
    console.log('Please set PAYPAL_CLIENT_ID_SANDBOX in your environment variables');
  }
  
  console.log(''); // Empty line for better readability
  
  // Check if Stripe is configured
  if (paymentService.isStripeConfigured()) {
    console.log('✅ Stripe service is configured');
    console.log(`🔑 Stripe Publishable Key: ${paymentService.getMaskedStripePublishableKey()}`);
    
    // Initialize Stripe client
    const stripeClient = await paymentService.initializeStripeClient();
    if (stripeClient) {
      console.log('🔗 Stripe Client initialized successfully');
      
      // Create a test Stripe payment intent
      const paymentIntent = await paymentService.createStripePaymentIntent(10000, 'usd', 'Test payment');
      if (paymentIntent) {
        console.log('💰 Stripe Payment Intent created:', paymentIntent);
      }
    }
  } else {
    console.log('⚠️  Stripe service is not configured');
    console.log('Please set STRIPE_PUBLISHABLE_KEY_TEST and STRIPE_SECRET_KEY_TEST in your environment variables');
  }
  
  console.log(''); // Empty line for better readability
  
  // Test generic payment processing
  console.log('🔄 Testing generic payment processing...');
  
  // Process a PayPal payment
  const paypalPayment = await paymentService.processPayment('PayPal', '50.00', 'USD', 'Generic PayPal payment test');
  if (paypalPayment) {
    console.log('💰 Generic PayPal Payment processed:', paypalPayment);
  }
  
  // Process a Stripe payment
  const stripePayment = await paymentService.processPayment('Stripe', 75.50, 'eur', 'Generic Stripe payment test');
  if (stripePayment) {
    console.log('💰 Generic Stripe Payment processed:', stripePayment);
  }
}

// Run the test
testPaymentIntegration().catch(console.error);