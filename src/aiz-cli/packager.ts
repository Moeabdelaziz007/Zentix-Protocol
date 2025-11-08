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
 * AIZ Packager
 * Packages a directory structure into an .aiz file
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as tar from 'tar';

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

/**
 * Package a directory into an .aiz file
 * @param sourceDir Directory to package
 * @param outputFile Output .aiz file path
 */
export async function packZone(sourceDir: string, outputFile: string): Promise<void> {
  return AgentLogger.measurePerformance(
    'AIZ_Packager',
    'pack_zone',
    async () => {
      AgentLogger.log('INFO', 'AIZ_Packager', 'starting_packaging', { sourceDir, outputFile });

      // Check if source directory exists
      if (!fs.existsSync(sourceDir)) {
        throw new Error(`Source directory ${sourceDir} does not exist`);
      }

      // Check if source directory is a directory
      const stat = fs.statSync(sourceDir);
      if (!stat.isDirectory()) {
        throw new Error(`Source ${sourceDir} is not a directory`);
      }

      // Check if manifest.json exists
      const manifestPath = path.join(sourceDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        throw new Error(`Missing manifest.json in ${sourceDir}`);
      }

      // Validate manifest
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.name || !manifest.version) {
        throw new Error('Invalid manifest: missing name or version');
      }

      AgentLogger.log('INFO', 'AIZ_Packager', 'manifest_validated', { 
        name: manifest.name, 
        version: manifest.version 
      });

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(outputFile);
      if (outputDir && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Create .aiz file (tar.gz format)
      await tar.create(
        {
          gzip: true,
          file: outputFile,
          cwd: sourceDir
        },
        ['.']
      );

      AgentLogger.log('SUCCESS', 'AIZ_Packager', 'zone_packaged', { 
        sourceDir, 
        outputFile,
        size: fs.statSync(outputFile).size
      });
    }
  );
}