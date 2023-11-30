#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { shell } from '../helpers/shell';

const libName = 'export-intellij-settings';
const methods = {
  specific: 'specific',
  codeStyleScheme: 'codeStyleScheme',
  codeStyleConfig: 'codeStyleConfig',
  webpack: 'webpack',
  eslint: 'eslint',
  eslintOnSave: 'eslintOnSave',
};
const srcMap = {
  [methods.codeStyleScheme]: './.idea/codeStyles/Project.xml',
  [methods.codeStyleConfig]: './.idea/codeStyles/codeStyleConfig.xml',
  [methods.webpack]: './.idea/misc.xml',
  [methods.eslint]: './.idea/inspectionProfiles/Project_Default.xml',
  [methods.eslintOnSave]: './.idea/jsLinters/eslint.xml',
};

export const exportCodeStyleScheme = (dest:string) => exportSpecific({ dest, src: srcMap[methods.codeStyleScheme] });
export const exportCodeStyleConfig = (dest:string) => exportSpecific({ dest, src: srcMap[methods.codeStyleConfig] });
export const exportWebpack = (dest:string) => exportSpecific({ dest, src: srcMap[methods.webpack] });
export const exportESLint = (dest:string) => exportSpecific({ dest, src: srcMap[methods.eslint] });
export const exportESLintOnSave = (dest:string) => exportSpecific({ dest, src: srcMap[methods.eslintOnSave] });

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

// ----- CLI FUNCTIONALITY -----

if (process.argv && [libName, libName + '.js'].includes(path.basename(process.argv[1]))) {
  const param1 = process.argv[3] ?? '';
  const param2 = process.argv[4] ?? '';
  const methodName = process.argv[2] ?? '';

  switch (methodName) {
    case methods.specific: exportSpecific({ src: param1, dest: param2 }); break;
    case methods.codeStyleScheme: exportCodeStyleScheme(param1); break;
    case methods.codeStyleConfig: exportCodeStyleConfig(param1); break;
    case methods.webpack: exportWebpack(param1); break;
    case methods.eslint: exportESLint(param1); break;
    case methods.eslintOnSave: exportESLintOnSave(param1); break;
    default: displayHelp();
  }
}

function displayHelp () {
  shell.write(`
usage: npx ${chalk.bold(libName)} <method> [<args>]

List of methods:
  ${chalk.bold(methods.specific)}
    npx ${libName} ${methods.specific} <src> <dest>
`);
  for (const methodName of Object.keys(methods).slice(1)) {
    shell.newLine();
    shell.tab();
    shell.write(`${chalk.bold(methodName)} – src: ${srcMap[methodName]}`);
    shell.newLine();
    shell.tab(2);
    shell.write(`npx ${libName} ${methodName} <dest>`);
    shell.newLine();
  }
  shell.newLine();
}



