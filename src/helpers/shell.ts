import chalk from 'chalk';

export const shell = {
  write: (text:string) => process.stdout.write(text),
  clear: () => shell.write('\x1Bc'),
  newLine: (count:number = 1) => shell.write('\n'.repeat(count)),
  tab: (count:number = 1) => shell.write('  '.repeat(count)),
  success: (text:string) => shell.write(chalk.green(text)),
  error: (err:Error) => shell.write(chalk.red(err.stack)),
};
