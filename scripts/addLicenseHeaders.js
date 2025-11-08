#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// MIT License header template for general files
const mitLicenseHeader = `/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */`;

// Solidity license header (full text)
const solidityLicenseHeader = `/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */`;

// Function to check if a file already has a license header
function hasLicenseHeader(content) {
  return content.includes('MIT License') || 
         content.includes('Copyright (c) 2025 Mohamed Hossameldin Abdelaziz');
}

// Function to add license header to a file
function addLicenseHeader(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has a license header
    if (hasLicenseHeader(content)) {
      console.log(`✅ License header already exists in ${filePath}`);
      return;
    }
    
    // Determine file type and appropriate header
    let headerToAdd = '';
    if (filePath.endsWith('.sol')) {
      headerToAdd = solidityLicenseHeader + '\n\n';
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      headerToAdd = mitLicenseHeader + '\n\n';
    } else {
      console.log(`⚠️  Unsupported file type for ${filePath}`);
      return;
    }
    
    // Write the file with the license header
    fs.writeFileSync(filePath, headerToAdd + content);
    console.log(`➕ Added license header to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

// Function to update Solidity files to include full license text
function updateSolidityLicenseHeaders(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has SPDX-License-Identifier but not full license text
    if (content.includes('SPDX-License-Identifier: MIT') && !content.includes('Permission is hereby granted')) {
      // Replace SPDX line with full license header
      const updatedContent = content.replace('// SPDX-License-Identifier: MIT', solidityLicenseHeader);
      fs.writeFileSync(filePath, updatedContent);
      console.log(`🔄 Updated license header in ${filePath}`);
    } else if (hasLicenseHeader(content)) {
      console.log(`✅ License header already exists in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

// Function to recursively process directories
function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      // Skip node_modules and other ignored directories
      if (item === 'node_modules' || item === '.git') {
        continue;
      }
      
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        processDirectory(itemPath);
      } else if (stat.isFile()) {
        if (item.endsWith('.sol')) {
          updateSolidityLicenseHeaders(itemPath);
        } else if (item.endsWith('.ts') || item.endsWith('.js')) {
          addLicenseHeader(itemPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}: ${error.message}`);
  }
}

// Main execution
function main() {
  console.log('🚀 Starting license header addition process...');
  
  // Process main directories
  const directories = [
    '/Users/cryptojoker710/Desktop/Zentix Protocol/src',
    '/Users/cryptojoker710/Desktop/Zentix Protocol/contracts',
    '/Users/cryptojoker710/Desktop/Zentix Protocol/scripts',
    '/Users/cryptojoker710/Desktop/Zentix Protocol/aiz-template'
  ];
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`\n📂 Processing directory: ${dir}`);
      processDirectory(dir);
    } else {
      console.log(`\n⚠️  Directory not found: ${dir}`);
    }
  }
  
  console.log('\n✅ License header addition process completed!');
}

// Run the script
main();