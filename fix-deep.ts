import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Function to fix :deep usage in a file
async function fixDeepInFile(filePath: string): Promise<boolean> {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Replace ":deep <selector>" with ":deep(<selector>)"
    const fixedContent = content.replace(/:deep\s+(\.[a-zA-Z0-9_-]+|\(\.?[a-zA-Z0-9_-]+\))/g, (match, selector) => {
      // If selector already has parentheses, don't add them again
      if (selector.startsWith('(') && selector.endsWith(')')) {
        return `:deep${selector}`;
      }
      return `:deep(${selector})`;
    });
    
    if (content !== fixedContent) {
      await writeFile(filePath, fixedContent, 'utf8');
      console.log(`Fixed :deep usage in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function to process all .vue files
async function main(): Promise<void> {
  const baseDir = process.cwd();
  const componentsDir = path.join(baseDir, 'components');
  const pagesDir = path.join(baseDir, 'pages');
  const viewsDir = path.join(baseDir, 'views');
  const layoutsDir = path.join(baseDir, 'layouts');
  
  const directories = [componentsDir, pagesDir, viewsDir, layoutsDir];
  let fixedCount = 0;
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) continue;
    
    const processDirectory = async (dirPath: string): Promise<void> => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else if (entry.name.endsWith('.vue')) {
          const fixed = await fixDeepInFile(fullPath);
          if (fixed) fixedCount++;
        }
      }
    };
    
    await processDirectory(dir);
  }
  
  console.log(`Fixed :deep usage in ${fixedCount} files`);
}

main().catch(console.error);