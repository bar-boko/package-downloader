import { Command } from 'commander';
import { CommandLineOptions } from '../models/Input';
import { parsePackages, parseThrottleLimit } from '../utils/CommandLineParsers';

export const createCommand = (): CommandLineOptions => {
  const program = new Command();
  
  program.version('1.0.0')
    .requiredOption('-p, --packages [...packages]', 'List of Packages', parsePackages)
    .option('-d, --devDeps', 'Download all Dev Dependencies')
    .option('-e, --peerDeps', 'Download all peer Dependencies')
    .option('-o, --output [outputDir]', 'Output Directory', './')
    .option('-l, --limit [throttleLimit]', 'Throttle Limit', parseThrottleLimit, 10);
  
  program.parse();
  
  return program.opts();
}