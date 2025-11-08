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

#!/usr/bin/env tsx
/**
 * AIZ CLI (AI Zone Command Line Interface)
 * Tool for packaging, running, and managing AI Zones
 */

import { Command } from 'commander';
import { packZone } from './packager';
import { runZone } from './runner';
import { listZones } from './manager';

// Simple logger
const AgentLogger = {
  log: (level: string, module: string, action: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] ${level} ${module}:${action}`, data || '');
  }
};

const program = new Command();

program
  .name('z-cli')
  .description('AI Zone (AIZ) Command Line Interface')
  .version('1.0.0');

program
  .command('package')
  .description('Package a directory into an .aiz file')
  .argument('<directory>', 'Directory to package')
  .option('-o, --output <file>', 'Output file name', 'output.aiz')
  .action(async (directory, options) => {
    try {
      AgentLogger.log('INFO', 'AIZ_CLI', 'packaging_zone', { directory, output: options.output });
      await packZone(directory, options.output);
      console.log(`✅ Successfully packaged ${directory} to ${options.output}`);
    } catch (error) {
      console.error('❌ Failed to package zone:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run an .aiz file')
  .argument('<file>', '.aiz file to run')
  .option('-e, --env <env>', 'Environment variables file')
  .action(async (file, options) => {
    try {
      AgentLogger.log('INFO', 'AIZ_CLI', 'running_zone', { file, env: options.env });
      await runZone(file, options.env);
      console.log(`✅ Successfully started zone from ${file}`);
    } catch (error) {
      console.error('❌ Failed to run zone:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available zones')
  .option('-a, --all', 'Show all zones including system zones')
  .action(async (options) => {
    try {
      AgentLogger.log('INFO', 'AIZ_CLI', 'listing_zones', { all: options.all });
      await listZones(options.all);
    } catch (error) {
      console.error('❌ Failed to list zones:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show information about a zone')
  .argument('<zone>', 'Zone name or file')
  .action(async (zone) => {
    try {
      console.log(`ℹ️  Zone information for ${zone}`);
      // Implementation would go here
    } catch (error) {
      console.error('❌ Failed to get zone info:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();