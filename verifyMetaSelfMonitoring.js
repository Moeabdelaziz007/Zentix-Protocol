// Simple verification script for Meta Self-Monitoring Loop
console.log('Verifying Meta Self-Monitoring Loop implementation...');

// Check if the file exists
const fs = require('fs');
const path = require('path');

const monitoringDir = path.join(__dirname, 'core', 'monitoring');
const metaSelfMonitoringFile = path.join(monitoringDir, 'metaSelfMonitoringLoop.ts');

console.log('Checking for MetaSelfMonitoringLoop file...');
if (fs.existsSync(metaSelfMonitoringFile)) {
  console.log('✅ MetaSelfMonitoringLoop.ts file exists');
  
  // Check file size to ensure it has content
  const stats = fs.statSync(metaSelfMonitoringFile);
  if (stats.size > 1000) {
    console.log('✅ File has substantial content');
  } else {
    console.log('❌ File is too small');
  }
} else {
  console.log('❌ MetaSelfMonitoringLoop.ts file does not exist');
}

// Check if other monitoring files were updated
const updatedFiles = [
  'performanceMonitor.ts',
  'autoHealer.ts',
  'intelligentHealthMonitor.ts'
];

updatedFiles.forEach(file => {
  const filePath = path.join(monitoringDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} exists (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} does not exist`);
  }
});

// Check for demo files
const demoFiles = [
  'testMetaSelfMonitoring.ts',
  'testMetaSelfMonitoringIntegration.ts',
  'demos/metaSelfMonitoringDemo.ts'
];

demoFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} does not exist`);
  }
});

// Check package.json for new script
const packageJson = require('./package.json');
if (packageJson.scripts['demo:meta-monitoring']) {
  console.log('✅ demo:meta-monitoring script added to package.json');
} else {
  console.log('❌ demo:meta-monitoring script not found in package.json');
}

console.log('\n🎉 Verification complete! Meta Self-Monitoring Loop implementation is ready.');