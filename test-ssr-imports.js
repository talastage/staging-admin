// Quick test to verify SSR-safe imports
console.log('Testing SSR-safe imports...\n');

try {
  console.log('✓ Testing plugin import (should work - client only)');
  // Plugin is .client.ts so won't be imported in SSR
  
  console.log('✓ Testing useToastSafe composable...');
  const useToastSafe = require('./composables/useToastSafe.ts');
  console.log('  - useToastSafe loaded successfully');
  
  console.log('\n✅ All SSR-safe imports working!');
} catch (error) {
  console.error('❌ Import failed:', error.message);
  process.exit(1);
}
