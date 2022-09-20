import * as chalk from 'chalk'
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';

export interface SingleCommonConfig {
  name: string
  defaultXMLPath: string
  targetXMLPath: string
  replaceIfTargetInvalid?: boolean
}

export interface SingleModifier extends SingleCommonConfig {
  validator(parsedJson:any): boolean
  modifier(parsedJson:any): string
  replaceIfExists: false
}
export interface SingleReplacer extends SingleCommonConfig{
  replaceIfExists: true
}

export type SingleModifierOrReplacer = SingleModifier|SingleReplacer
export type ListOfModifiersOrReplacers = SingleModifierOrReplacer[]

export async function initIntellijSettings(modifiersOrReplacers:ListOfModifiersOrReplacers) {
  try {
    shell.clear();
    shell.newLine();
    shell.write(chalk.bold('Initialize Intellij Settings'));
    shell.newLine();

    for (const config of modifiersOrReplacers) {
      shell.newLine()
      shell.write('  ' + config.name)

      config.replaceIfExists
        ? await replaceXMLSettings(config as SingleReplacer)
        : await modifyXMLSettings(config as SingleModifier)

      shell.write(chalk.green(config.targetXMLPath));
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

async function replaceXMLSettings (config:SingleModifierOrReplacer) {
  const { targetXMLPath } = config
  const { defaultXMLString, targetXMLExists } = prepareForChangingSettings(config)

  if (targetXMLExists)
    fs.rmSync(targetXMLPath)

  fs.writeFileSync(targetXMLPath, defaultXMLString);

  targetXMLExists
    ? shell.write(chalk.green.bold('    replaced '))
    : shell.write(chalk.green.bold('    created '));
}

async function modifyXMLSettings (config:SingleModifier) {
  const { targetXMLPath, validator, modifier } = config
  const { defaultXMLString, targetXMLNotExists } = prepareForChangingSettings(config)

  try {
    if (targetXMLNotExists) {
      fs.writeFileSync(targetXMLPath, defaultXMLString);
      shell.write(chalk.green.bold('    created '));
    }
    else {
      const targetXML = fs.readFileSync(targetXMLPath, 'utf-8');
      const targetJSON = await xml2js.parseStringPromise(targetXML);

      if (targetJSON === null || !validator(targetJSON))
        throw new Error(`File "${targetXMLPath}" has unexpected structure or it's corrupted.`);

      const modifiedTargetJSON = modifier(targetJSON);

      const builder = new xml2js.Builder();
      const newTargetXML = builder.buildObject(modifiedTargetJSON);

      fs.writeFileSync(targetXMLPath, newTargetXML);
      shell.write(chalk.green.bold('    modified '));
    }
  }
  catch (err) {
    if (config.replaceIfTargetInvalid === true)
      await replaceXMLSettings(config)
    else
      throw err
  }
}

function prepareForChangingSettings (config:SingleModifierOrReplacer) {
  const { defaultXMLPath, targetXMLPath } = config

  if (!fs.existsSync(defaultXMLPath)) throw new Error(`File "${defaultXMLPath}" must exists.`);

  const targetXMLExists = fs.existsSync(targetXMLPath);
  const targetXMLNotExists = !targetXMLExists;
  const defaultXMLString = fs.readFileSync(defaultXMLPath, 'utf-8');
  const dirnameTargetPath = path.dirname(targetXMLPath);
  const dirnameTargetExists = fs.existsSync(dirnameTargetPath);
  const dirnameTargetNotExists = !dirnameTargetExists;

  dirnameTargetNotExists && fs.mkdirSync(dirnameTargetPath, { recursive: true });

  return {
    defaultXMLString,
    targetXMLExists,
    targetXMLNotExists,
  }
}

const shell = {
  error: (err:Error) => process.stderr.write(chalk.red(err.stack)),
  clear: () => process.stdout.write('\x1Bc'),
  write: (text:string) => process.stdout.write(text),
  newLine: (count:number = 1) => process.stdout.write('\n'.repeat(count)),
  tab: (count:number = 1) => process.stdout.write('  '.repeat(count)),
};
