#!/usr/bin/env node

/**
 * Post-build script to update deploy-manifest.json files to use nodejs20.x
 * This is required because AWS Amplify no longer supports nodejs18.x
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

// List of potential deploy-manifest.json locations
const manifestPaths = [
  path.join(rootDir, '.amplify-hosting', 'deploy-manifest.json'),
  path.join(rootDir, 'deploy-manifest.json'),
  path.join(rootDir, '.output', 'deploy-manifest.json'),
]

let updatedCount = 0
let errorCount = 0

console.log('🔧 Fixing deploy-manifest.json files for AWS Amplify...\n')

for (const manifestPath of manifestPaths) {
  try {
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(content)
      
      // Update compute resources to use nodejs20.x
      if (manifest.computeResources && Array.isArray(manifest.computeResources)) {
        let resourceUpdated = false
        
        manifest.computeResources = manifest.computeResources.map((resource) => {
          if (resource.runtime && resource.runtime !== 'nodejs20.x') {
            console.log(`  📝 Updating runtime from ${resource.runtime} to nodejs20.x in ${path.relative(rootDir, manifestPath)}`)
            resourceUpdated = true
            return { ...resource, runtime: 'nodejs20.x' }
          }
          return resource
        })
        
        if (resourceUpdated) {
          fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
          console.log(`  ✅ Updated ${path.relative(rootDir, manifestPath)}\n`)
          updatedCount++
        } else {
          console.log(`  ℹ️  ${path.relative(rootDir, manifestPath)} already uses nodejs20.x\n`)
        }
      }
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${path.relative(rootDir, manifestPath)}:`, error.message, '\n')
    errorCount++
  }
}

console.log('─'.repeat(60))
if (updatedCount > 0) {
  console.log(`✅ Successfully updated ${updatedCount} deploy-manifest.json file(s)`)
} else {
  console.log('ℹ️  No deploy-manifest.json files needed updating')
}

if (errorCount > 0) {
  console.log(`⚠️  Encountered ${errorCount} error(s) during processing`)
  process.exit(1)
}

process.exit(0)
