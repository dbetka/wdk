#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import { shell } from '../helpers/shell';

const libName = 'export-intellij-settings';

export interface ExportIntellijSettingsConfig {
  src:string;
  dest:string;
}

export function exportSpecific (config:ExportIntellijSettingsConfig) {
  const { src, dest } = config;
  const destDirname = path.dirname(dest);

  if (!fs.existsSync(src)) throw new Error(`File '${src}' must exists.`);
  if (!fs.existsSync(destDirname)) fs.mkdirSync(destDirname, { recursive: true });

  fs.copyFileSync(src, dest, fs.constants.COPYFILE_FICLONE);

  shell.tab();
  shell.success('Exported to ' + dest);
  shell.newLine();
}

export function exportCodeStyleScheme (dest:string) {
  exportSpecific({
    src: './.idea/codeStyles/Project.xml',
    dest,
  });
}

// ----- CLI FUNCTIONALITY -----

const methods = {
  specific: 'specific',
  codeStyleScheme: 'codeStyleScheme',
};

if (process.argv) {
  const methodName = process.argv[2] as string;

  switch (methodName) {
    case methods.specific:
      exportSpecific({ src: process.argv[3], dest: process.argv[4] });
      break;
    case methods.codeStyleScheme:
      exportCodeStyleScheme(process.argv[3]);
      break;
    default:
      displayHelp();
  }
}

function displayHelp () {
  shell.write(`
usage: ${chalk.bold(libName)} <method> [<args>]

List of methods:
  ${chalk.bold(methods.specific)}
    ${libName} ${methods.specific} <src> <dest>
    
  ${chalk.bold(methods.codeStyleScheme)}
    ${libName} ${methods.codeStyleScheme} <dest>
`);
  shell.newLine();
}



