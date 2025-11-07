import { runAetherDemo } from '../core/orchestration/aetherDemo';

// Run the Aether demo
runAetherDemo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});