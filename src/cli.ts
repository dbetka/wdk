#!/usr/bin/env node

import {execSync} from 'child_process';
import {shell} from './helpers/shell';

if (process.argv) {
  const [interpreter, script, ...args] = process.argv;

  shell.write('npx ' + args.join(' '));

  const output = execSync('npx ' + args.join(' '));
  shell.write(output.toString('utf-8'));
}
