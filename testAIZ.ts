// testAIZ.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function testAIZ() {
  console.log('🧪 Testing AIZ (AI Zone) functionality...\n');
  
  try {
    // Test 1: Package a zone
    console.log('📦 Test 1: Packaging revenue_gen zone...');
    const { stdout: packStdout, stderr: packStderr } = await execPromise(
      'npx tsx src/aiz-cli/index.ts package zones/revenue_gen --output zones/revenue_gen.aiz',
      { timeout: 10000 }
    );
    
    if (packStdout) {
      console.log('✅ Packaging output:');
      console.log(packStdout);
    }
    
    if (packStderr) {
      console.log('⚠️  Packaging warnings:');
      console.log(packStderr);
    }
    
    // Test 2: List zones
    console.log('\n📋 Test 2: Listing zones...');
    const { stdout: listStdout, stderr: listStderr } = await execPromise(
      'npx tsx src/aiz-cli/index.ts list',
      { timeout: 5000 }
    );
    
    if (listStdout) {
      console.log('✅ Listing output:');
      console.log(listStdout);
    }
    
    if (listStderr) {
      console.log('⚠️  Listing warnings:');
      console.log(listStderr);
    }
    
    console.log('\n🎉 AIZ tests completed successfully!');
    
  } catch (error: any) {
    console.log('❌ AIZ tests failed:');
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

testAIZ();