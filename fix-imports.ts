import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Function to fix imports in a file
async function fixImportsInFile(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf8');
    let fixedContent = content;
    
    // Fix UseFetchOptions import
    if (filePath.includes('plugins/api.ts') || filePath.includes('composables/useApi.ts')) {
      fixedContent = fixedContent.replace(
        /import\s*{\s*[^}]*UseFetchOptions[^}]*\s*}\s*from\s*['"]nuxt\/app['"]/g,
        `import type { UseFetchOptions } from '#app'`
      );
    }
    
    // Fix Pinia import
    if (filePath.includes('plugins/pinia-persistedstate.ts')) {
      fixedContent = fixedContent.replace(
        /import\s*{\s*[^}]*Pinia[^}]*\s*}\s*from\s*['"]pinia['"]/g,
        `import type { Pinia } from 'pinia'`
      );
    }
    
    // Fix TipSummary and Tip imports
    if (filePath.includes('components/tips/TipsSummaryCard.vue') || filePath.includes('components/tips/TipListItem.vue')) {
      fixedContent = fixedContent.replace(
        /import\s*{\s*[^}]*(Tip|TipSummary)[^}]*\s*}\s*from\s*['"]types\/tips['"]/g,
        `import type { $1 } from 'types/tips'`
      );
    }
    
    // Fix UserProfile import
    if (filePath.includes('stores/useProfileStore.ts')) {
      fixedContent = fixedContent.replace(
        /import\s*{\s*[^}]*UserProfile[^}]*\s*}\s*from\s*['"]types\/user['"]/g,
        `import type { UserProfile } from 'types/user'`
      );
    }
    
    // Fix Payment import
    if (filePath.includes('views/payments/UserPaymentDetailPage.vue')) {
      fixedContent = fixedContent.replace(
        /import\s*{\s*[^}]*Payment[^}]*\s*}\s*from\s*['"]composables\/useUserPayments['"]/g,
        `import type { Payment } from 'composables/useUserPayments'`
      );
    }
    
    if (content !== fixedContent) {
      await writeFile(filePath, fixedContent, 'utf8');
      console.log(`Fixed imports in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function to process specific files
async function main(): Promise<void> {
  const baseDir = process.cwd();
  const filesToFix = [
    path.join(baseDir, 'plugins/api.ts'),
    path.join(baseDir, 'plugins/pinia-persistedstate.ts'),
    path.join(baseDir, 'composables/useApi.ts'),
    path.join(baseDir, 'components/tips/TipsSummaryCard.vue'),
    path.join(baseDir, 'components/tips/TipListItem.vue'),
    path.join(baseDir, 'stores/useProfileStore.ts'),
    path.join(baseDir, 'views/payments/UserPaymentDetailPage.vue')
  ];
  
  let fixedCount = 0;
  
  for (const filePath of filesToFix) {
    if (fs.existsSync(filePath)) {
      const fixed = await fixImportsInFile(filePath);
      if (fixed) fixedCount++;
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
  
  console.log(`Fixed imports in ${fixedCount} files`);
}

main().catch(console.error);