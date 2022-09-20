import * as chalk from 'chalk'
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

export interface SingleModifier {
  name: string
  defaultXMLPath: string
  targetXMLPath: string
  validator(json:[]|object): boolean
  modifier(json:[]|object): string
}

export async function initIntellijSettings(modifiers:SingleModifier[]) {
  try {
    shell.clear();
    shell.newLine();
    shell.write(chalk.bold('Initialize Intellij Settings'));
    shell.newLine();

    for (const modifierConfig of modifiers) {
      shell.newLine()
      shell.write('  ' + modifierConfig.name)
      await modifyXMLSettings(modifierConfig)
    }

    shell.newLine();
    shell.newLine();
    shell.write(chalk.bold.green('  All done!'));
  }
  catch (err) {
    shell.tab(2)
    shell.write(chalk.bold.red('failed'))
    shell.newLine();
    shell.tab(2)
    shell.error(err as Error);
    shell.newLine();
    process.exit(1);
  }
}

async function modifyXMLSettings (config:SingleModifier) {
  const {
    defaultXMLPath,
    targetXMLPath,
    validator,
    modifier,
  } = config

  if (fs.existsSync(defaultXMLPath) === false) throw new Error(`File "${defaultXMLPath}" must exists.`);

  const defaultXMLString = fs.readFileSync(defaultXMLPath, 'utf-8');
  const targetXMLExists = fs.existsSync(targetXMLPath);
  const dirnameTarget = path.dirname(targetXMLPath);

  if (targetXMLExists === false) {
    fs.existsSync(dirnameTarget) === false && fs.mkdirSync(dirnameTarget, { recursive: true });
    fs.writeFileSync(targetXMLPath, defaultXMLString);
  }
  else {
    const targetXML = fs.readFileSync(targetXMLPath, 'utf-8');

    const targetJSON = await xml2js.parseStringPromise(targetXML);
    if (targetJSON === null || validator(targetJSON)) throw new Error(`File "${targetXMLPath}" has invalid structure or is corrupted.`);

    const modifiedTargetJSON = modifier(targetJSON);

    const builder = new xml2js.Builder();
    const newTargetXML = builder.buildObject(modifiedTargetJSON);

    fs.writeFileSync(targetXMLPath, newTargetXML);
  }

  shell.write(chalk.green.bold('    done '));
  shell.write(chalk.green(targetXMLPath));
}

const shell = {
  error: (err:Error) => process.stderr.write(chalk.red(err.stack)),
  clear: () => process.stdout.write('\x1Bc'),
  write: (text:string) => process.stdout.write(text),
  newLine: (count:number = 1) => process.stdout.write('\n'.repeat(count)),
  tab: (count:number = 1) => process.stdout.write('  '.repeat(count)),
};
