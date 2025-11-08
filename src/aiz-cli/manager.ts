/**
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
 */

/**
 * AIZ Manager
 * Manages available zones and their metadata
 */

import * as fs from 'fs-extra';
import * as path from 'path';

// Simple logger
const AgentLogger = {
  log: (level: string, module: string, action: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] ${level} ${module}:${action}`, data || '');
  },
  measurePerformance: async <T>(module: string, action: string, fn: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      AgentLogger.log('INFO', module, `${action}_completed`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      AgentLogger.log('ERROR', module, `${action}_failed`, { duration: `${duration}ms`, error });
      throw error;
    }
  }
};

// Default zones directory
const DEFAULT_ZONES_DIR = path.join(process.cwd(), 'zones');

/**
 * List available zones
 * @param showAll Whether to show all zones including system zones
 */
export async function listZones(showAll: boolean = false): Promise<void> {
  return AgentLogger.measurePerformance(
    'AIZ_Manager',
    'list_zones',
    async () => {
      AgentLogger.log('INFO', 'AIZ_Manager', 'listing_zones', { showAll });

      // Check if zones directory exists
      if (!fs.existsSync(DEFAULT_ZONES_DIR)) {
        console.log('No zones directory found. Create one to start managing zones.');
        return;
      }

      // Read zones directory
      const items = fs.readdirSync(DEFAULT_ZONES_DIR);
      
      if (items.length === 0) {
        console.log('No zones found in zones directory.');
        return;
      }

      console.log('\nAvailable AI Zones:');
      console.log('===================');

      for (const item of items) {
        const itemPath = path.join(DEFAULT_ZONES_DIR, item);
        const stat = fs.statSync(itemPath);
        
        // Only show directories and .aiz files
        if (stat.isDirectory() || (stat.isFile() && item.endsWith('.aiz'))) {
          // Skip system zones unless showAll is true
          if (!showAll && item.startsWith('.')) {
            continue;
          }
          
          if (stat.isDirectory()) {
            // For directory zones, look for manifest
            const manifestPath = path.join(itemPath, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
              try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                console.log(`📁 ${manifest.name || item} (v${manifest.version || '0.0.0'})`);
                if (manifest.description) {
                  console.log(`   ${manifest.description}`);
                }
              } catch (e) {
                console.log(`📁 ${item} (invalid manifest)`);
              }
            } else {
              console.log(`📁 ${item} (no manifest)`);
            }
          } else {
            // For .aiz files, just show the filename
            console.log(`📦 ${item}`);
          }
        }
      }
      
      console.log('');
    }
  );
}

/**
 * Get zone information
 * @param zoneName Zone name or file path
 */
export async function getZoneInfo(zoneName: string): Promise<any> {
  // Implementation would go here
  return {};
}