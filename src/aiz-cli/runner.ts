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
 * AIZ Runner
 * Runs an .aiz file in a sandboxed environment
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as tar from 'tar';
import * as os from 'os';
import { spawn } from 'child_process';

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
 * Run an .aiz file
 * @param aizFile Path to .aiz file
 * @param envFile Optional environment variables file
 */
export async function runZone(aizFile: string, envFile?: string): Promise<void> {
  return AgentLogger.measurePerformance(
    'AIZ_Runner',
    'run_zone',
    async () => {
      AgentLogger.log('INFO', 'AIZ_Runner', 'starting_zone', { aizFile, envFile });

      // Check if .aiz file exists
      if (!fs.existsSync(aizFile)) {
        throw new Error(`AIZ file ${aizFile} does not exist`);
      }

      // Create temporary directory for extraction
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiz-run-'));
      AgentLogger.log('INFO', 'AIZ_Runner', 'created_temp_dir', { tempDir });

      try {
        // Extract .aiz file
        await tar.extract({
          file: aizFile,
          cwd: tempDir
        });

        AgentLogger.log('INFO', 'AIZ_Runner', 'extracted_zone', { aizFile, tempDir });

        // Check for manifest
        const manifestPath = path.join(tempDir, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          throw new Error('Missing manifest.json in zone package');
        }

        // Load manifest
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        AgentLogger.log('INFO', 'AIZ_Runner', 'loaded_manifest', { 
          name: manifest.name, 
          version: manifest.version 
        });

        // Load environment variables if provided
        let envVars: Record<string, string> = {};
        if (envFile && fs.existsSync(envFile)) {
          const envContent = fs.readFileSync(envFile, 'utf8');
          envContent.split('\n').forEach((line: string) => {
            const [key, value] = line.split('=');
            if (key && value) {
              envVars[key.trim()] = value.trim();
            }
          });
          AgentLogger.log('INFO', 'AIZ_Runner', 'loaded_env_vars', { count: Object.keys(envVars).length });
        }

        // Look for entry point (default to index.js)
        const entryPoints = [
          'index.js',
          'main.js',
          'start.js',
          `${manifest.name}.js`
        ];

        let entryPoint: string | null = null;
        for (const ep of entryPoints) {
          const epPath = path.join(tempDir, ep);
          if (fs.existsSync(epPath)) {
            entryPoint = epPath;
            break;
          }
        }

        if (!entryPoint) {
          throw new Error('No entry point found in zone package');
        }

        AgentLogger.log('INFO', 'AIZ_Runner', 'found_entry_point', { entryPoint });

        // Run the zone in a child process
        const child = spawn('node', [entryPoint], {
          cwd: tempDir,
          env: {
            ...process.env,
            ...envVars,
            AIZ_ZONE_NAME: manifest.name,
            AIZ_ZONE_VERSION: manifest.version,
            AIZ_TEMP_DIR: tempDir
          }
        });

        child.stdout.on('data', (data) => {
          console.log(`[ZONE:${manifest.name}] ${data}`);
        });

        child.stderr.on('data', (data) => {
          console.error(`[ZONE:${manifest.name}] ${data}`);
        });

        child.on('close', (code) => {
          AgentLogger.log('INFO', 'AIZ_Runner', 'zone_process_closed', { 
            name: manifest.name, 
            exitCode: code 
          });
          
          // Clean up temp directory
          fs.rmSync(tempDir, { recursive: true, force: true });
        });

        AgentLogger.log('SUCCESS', 'AIZ_Runner', 'zone_started', { 
          name: manifest.name, 
          pid: child.pid 
        });

      } catch (error) {
        // Clean up temp directory on error
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
        throw error;
      }
    }
  );
}