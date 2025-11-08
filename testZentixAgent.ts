import { ZentixAgent } from './core/agents/zentixAgent';

async function testZentixAgent() {
  console.log('Testing ZentixAgent...');
  
  try {
    const agent = new ZentixAgent();
    console.log('ZentixAgent instantiated successfully');
    
    // Test method calls
    const result = await agent.handleInstruction({ test: "test" }, "test-context");
    console.log('Method call successful:', result);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testZentixAgent();