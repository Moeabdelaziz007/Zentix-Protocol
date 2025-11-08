// testFOCGAgentService.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function testFOCGAgentService() {
  console.log('🧪 Testing FOCG Agent Service...\n');
  
  try {
    // Run the FOCG agent demo
    console.log('🚀 Running FOCG Agent demo...');
    const { stdout, stderr } = await execPromise('npm run demo:focg', { 
      timeout: 30000,
      cwd: process.cwd()
    });
    
    if (stdout) {
      console.log('✅ FOCG Agent demo output:');
      console.log(stdout);
    }
    
    if (stderr) {
      console.log('⚠️  FOCG Agent demo warnings:');
      console.log(stderr);
    }
    
    console.log('\n🎉 FOCG Agent Service test completed!');
    
  } catch (error: any) {
    console.log('❌ FOCG Agent Service test failed:');
    console.log(error.message);
    
    // Show error output if available
    if (error.stdout) {
      console.log('Output:');
      console.log(error.stdout);
    }
    
    if (error.stderr) {
      console.log('Error output:');
      console.log(error.stderr);
    }
  }
}

testFOCGAgentService();