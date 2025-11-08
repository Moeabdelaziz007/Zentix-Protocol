// testAIXLoader.ts
import { loadAIX } from './src/core/loadAIX';

// Test loading LunaTravelApp AIX DNA
console.log('Testing AIX DNA Loader...');
try {
  const lunaDNA = loadAIX('LunaTravelApp');
  console.log('✅ LunaTravelApp DNA loaded successfully');
  console.log('Main Agent:', lunaDNA.main_agent.id);
  console.log('Sub Agents:', lunaDNA.sub_agents.map((agent: any) => agent.id));
  
  // Test loading ZentixAgent AIX DNA
  const zentixDNA = loadAIX('ZentixAgent');
  console.log('✅ ZentixAgent DNA loaded successfully');
  console.log('Main Agent:', zentixDNA.main_agent.id);
  console.log('Sub Agents:', zentixDNA.sub_agents.map((agent: any) => agent.id));
} catch (error) {
  console.error('❌ Error loading AIX DNA:', error);
}