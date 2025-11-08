// testSuperchainConnection.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function testSuperchainConnection() {
  console.log('🧪 Testing Superchain Connection...\n');
  
  try {
    // Run the superchain connection demo
    console.log('🚀 Running Superchain connection script...');
    const { stdout, stderr } = await execPromise('npm run demo:superchain', { 
      timeout: 30000,
      cwd: process.cwd()
    });
    
    if (stdout) {
      console.log('✅ Connection test output:');
      console.log(stdout);
    }
    
    if (stderr) {
      console.log('⚠️  Connection test warnings:');
      console.log(stderr);
    }
    
    console.log('\n🎉 Superchain connection test completed!');
    
  } catch (error: any) {
    console.log('❌ Connection test failed:');
    console.log(error.message);
    
    // Show error output if available
    if (error.stdout) {
      console.log('Output:', error.stdout);
    }
    if (error.stderr) {
      console.log('Error output:', error.stderr);
    }
  }
}

// Run the test
testSuperchainConnection();