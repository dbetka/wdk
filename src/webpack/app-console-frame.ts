import * as chalk from 'chalk';
import * as dayjs from 'dayjs';
import { Table } from 'console-table-printer';
import { progressBarPlugin } from './progress-bar';
import type { ProgressBarPluginType } from './progress-bar';
import * as duration from 'dayjs/plugin/duration';
import type { Compiler, WebpackOptionsNormalized, Stats, WebpackPluginInstance } from 'webpack';
import * as webpack from 'webpack';
import { Dayjs } from "dayjs";

dayjs.extend(duration);

declare type AdditionalActivities = undefined | [
  {
    name: string
    method(): Promise<string | undefined>
    output?: boolean
  }
];

declare interface AppConsoleFramePluginConfigType {
  appName: string;
  isClientApp?: boolean;
  appVersion: string;
  target: string;
  onBuildBefore?: AdditionalActivities;
  onBuildDone?: AdditionalActivities;
}

const getLinesDown = (list?: AdditionalActivities) => list?.length ? list?.length + 2 : 0;

export function appConsoleFramePlugin(webpackExternal: typeof webpack, config: AppConsoleFramePluginConfigType) {
  const progressBar = progressBarPlugin(webpackExternal, { linesBeforeBar: getLinesDown(config.onBuildBefore) });
  const mainPlugin = new AppConsoleFramePlugin(config, progressBar);

  const plugins:WebpackPluginInstance[] = [mainPlugin];
  progressBar.plugin && plugins.push(progressBar.plugin);
  return plugins;
}

class AppConsoleFramePlugin {
  config: AppConsoleFramePluginConfigType;
  progressBar: ProgressBarPluginType;
  startTime: null | Dayjs = null;

  constructor (config: AppConsoleFramePluginConfigType, progressBar: ProgressBarPluginType) {
    this.config = config;
    this.progressBar = progressBar;
  }

  apply (compiler: Compiler) {
    const pluginName = AppConsoleFramePlugin.name;
    const { appName, isClientApp = true, appVersion, target } = this.config;
    const clientText = isClientApp ? ' Client' : '';
    const mode = this.capitalizeFirstChar(compiler.options.mode ? compiler.options.mode : '');
    const targetText = this.capitalizeFirstChar(target);
    const watch = this.capitalizeFirstChar(compiler.options.watch ? 'watch' : 'single run');

    const makeLogo = () => {
      this.clearConsole();
      this.newLine();
      this.writeLogo(`${appName}${clientText} v${appVersion}`, 44);
      this.newLine();
      this.write(`  ${mode} - ${targetText} - ${watch}`);
      this.newLine(2);
    };

    const init = async (compilerStats: Compiler, callback: () => void) => {
      this.startTime = dayjs();
      makeLogo();
      await this.runAdditionalActivities(this.config.onBuildBefore, 'Before');
      this.newLine();
      this.progressBar.start();
      callback();
    };

    if (compiler.options.watch)
      compiler.hooks.watchRun.tapAsync(pluginName, init);
    else
      compiler.hooks.beforeRun.tapAsync(pluginName, init);

    compiler.hooks.done.tapAsync(pluginName,
      (stats: Stats, callback) => {
        if (stats.compilation.errors.length > 0 || stats.compilation.warnings.length > 0) {
          this.newLine(2);
          this.progressBar.stop();
          callback();
          return;
        }
        callback();

        setTimeout(() => {
          this.cursorTo(0, 6 + getLinesDown(this.config.onBuildBefore), async () => {

            await this.runAdditionalActivities(this.config.onBuildDone, 'After');
            this.newLine();

            const time = Math.abs(dayjs(this.startTime).diff(dayjs(), 'second', true));
            this.writeAssetsSizes(stats);
            this.newLine();
            this.write(chalk.green('  Done at ' + chalk.bold(dayjs().format('HH:mm:ss'))));
            this.newLine();
            this.write(chalk.green.bold(`  Build completed in ${time}s`));
            this.newLine();

            if (compiler.options.watch) {
              this.newLine();
              this.write('  Waiting for changes...');
            }
          });
        }, 200);
      },
    );
  }

  async runAdditionalActivities (activitiesList:AdditionalActivities, label:string = 'Additional') {
    const activitiesDefined = activitiesList && activitiesList?.length > 0;

    if (activitiesDefined) {
      this.write(`  ${label} activities:`);
      this.newLine();

      for (const activity of activitiesList) {
        try {
          this.write(chalk.dim(`  - ${activity.name} `));
          const activityOutput = await activity.method();
          this.write(chalk.green(`   Done!`));
          this.newLine();
          if (activity.output && activityOutput) this.write(activityOutput);

        } catch (error) {
          this.write(chalk.red.bold(`    Failed!`));
          this.newLine(2);
          this.write(String(error));
          process.exit(1);
        }
      }
    }

    return Promise.resolve();
  }

  capitalizeFirstChar (text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  writeLogo (text: string, length: number) {
    const oneSideLength = (length - text.length) / 2;
    this.write(
      chalk.reset.bgGreen.bold(
        ' '.repeat(oneSideLength) +
        text +
        ' '.repeat(oneSideLength),
      ),
    );
  }

  writeAssetsSizes (stats: Stats) {
    const table = new Table(this.tableConfig());
    const availableExt = ['js'];
    const isProductionMode = stats.compilation.compiler.options.mode === 'production';
    const performance = (stats.compilation.compiler.options as WebpackOptionsNormalized).performance || {};
    let maxAssetSize = 0;
    if ('maxAssetSize' in performance) {
      maxAssetSize = performance?.maxAssetSize || 0;
    }

    for (const assetName in stats.compilation.assets) {
      if (stats.compilation.assets.hasOwnProperty(assetName)) {
        const asset = stats.compilation.assets[assetName];
        const assetExt = assetName.split('.').pop() || '';
        const assetSize = (Math.round(asset.size() / 1024)) + ' KB';

        const firstAssetNamePart = assetName.split('.')[0];
        const secondAssetNamePart = assetName.split('.').splice(1).join('.');
        const styledAssetName = chalk.reset.bold(firstAssetNamePart) + chalk.dim('.' + secondAssetNamePart);

        const isOverSizeLimit = asset.size() > maxAssetSize;
        const writeWithColor = chalk.bold[isOverSizeLimit && isProductionMode ? 'yellow' : 'green'];

        if (availableExt.includes(assetExt)) {
          table.addRow({ file: styledAssetName, size: writeWithColor(assetSize) });
        }
      }
    }
    const tableWithoutHeader = table.render().split('\n').splice(3).join('\n');
    this.write(tableWithoutHeader);
  }

  clearConsole () {
    process.stdout.write('\x1Bc');
  }

  clearLine () {
    process.stdout.clearLine && process.stdout.clearLine(0);
  }

  clearRight () {
    process.stdout.clearLine && process.stdout.clearLine(1);
  }

  clearDown () {
    process.stdout.clearScreenDown && process.stdout.clearScreenDown();
  }

  newLine (numberOfNewLines = 1) {
    for (let i = 0; i < numberOfNewLines; ++i) {
      process.stdout.write('\n');
      this.clearLine();
      this.clearDown();
    }
  }

  write (text: string) {
    this.clearRight();
    this.clearDown();
    process.stdout.write(text);
  }

  cursorTo (x: number, y?: number, callback?: () => void) {
    if (process.stdout.cursorTo)
      process.stdout.cursorTo(x, y, callback);
    else if (callback) {
      this.newLine();
      callback();
    }
  }

  tableConfig () {
    return {
      columns: [{ name: 'file', alignment: 'left' }],
      style: {
        headerTop: {
          left: '',
          mid: '',
          right: '',
          other: '',
        },
        headerBottom: {
          left: '',
          mid: '',
          right: '',
          other: '',
        },
        tableBottom: {
          left: '',
          mid: '',
          right: '',
          other: '',
        },
        vertical: ' ',
        rowSeparator: {
          left: '',
          mid: '',
          right: '',
          other: '',
        },
      },
    };
  }
}
