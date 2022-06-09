import * as chalk from 'chalk'
import * as dayjs from 'dayjs'
import { Table } from 'console-table-printer'
import { progressBarPlugin } from './progress-bar'
import type {ProgressBarPluginType} from './progress-bar';
import * as duration from 'dayjs/plugin/duration'
import type { Compiler, WebpackOptionsNormalized, Stats } from 'webpack'

dayjs.extend(duration);

declare interface AppConsoleFramePluginConfigType {
  appName: string
  isClientApp?: boolean
  appVersion: string
  target: string
  onBuildDone?: [
    {
      name: string
      method(): Promise<string|undefined>
      output?: boolean
    }
  ]
}

export function appConsoleFramePlugin(config: AppConsoleFramePluginConfigType) {
  const progressBar = progressBarPlugin()
  const mainPlugin = new AppConsoleFramePlugin(config, progressBar)

  return [
    mainPlugin,
    progressBar.plugin,
  ]
}

class AppConsoleFramePlugin {
  config: AppConsoleFramePluginConfigType
  progressBar: ProgressBarPluginType

  constructor (config: AppConsoleFramePluginConfigType, progressBar: ProgressBarPluginType) {
    this.config = config;
    this.progressBar = progressBar;
  }

  apply (compiler: Compiler) {
    const pluginName = AppConsoleFramePlugin.name;
    const { appName, isClientApp = true, appVersion, target } = this.config;
    const clientText = isClientApp ? ' Client' : ''
    const mode = this.capitalizeFirstChar(compiler.options.mode ? compiler.options.mode : '');
    const targetText = this.capitalizeFirstChar(target);
    const watch = this.capitalizeFirstChar(compiler.options.watch ? 'watch' : 'single run');

    const makeLogo = () => {
      this.clear();
      this.newLine();
      this.writeLogo(`${appName}${clientText} v${appVersion}`, 44);
      this.newLine();
      this.write(`  ${mode} - ${targetText} - ${watch}`);
      this.newLine(2);
      this.progressBar.start();
    };

    if (compiler.options.watch) {
      compiler.hooks.watchRun.tap(pluginName,
        makeLogo,
      );
    } else {
      compiler.hooks.beforeRun.tap(pluginName,
        makeLogo,
      );
    }

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
          process.stderr.cursorTo(0, 6, () => {
            const time = Math.abs(dayjs(stats.startTime).diff(stats.endTime, 'second', true));

            this.writeAssetsSizes(stats);
            this.newLine();
            this.write(chalk.green('  Done at ' + chalk.bold(dayjs().format('HH:mm:ss'))));
            this.newLine();
            this.write(chalk.green.bold(`  Build completed in ${time}s`));
            this.newLine(2);

              this.runAdditionalActivities()
                .then(() => {
                  if (compiler.options.watch) {
                    this.newLine()
                    this.write('  Waiting for changes...');
                  }
                })
          });
        }, 200);
      },
    );
  }

  async runAdditionalActivities () {
    const onBuildDone = this.config.onBuildDone
    const onBuildDoneDefined = onBuildDone && onBuildDone?.length > 0

    if (onBuildDoneDefined) {
      this.write(chalk.bold(`  Additional activities:`));
      this.newLine();

      for (const activity of onBuildDone) {
        try {
          this.write(`  - ${activity.name}`);
          const activityOutput = await activity.method();
          this.write(chalk.green.bold(`    Done!`))
          this.newLine()
          if (activity.output && activityOutput) this.write(activityOutput)

        } catch (error) {
          this.write(chalk.red.bold(`    Failed!`))
          this.newLine(2)
          this.write(String(error))
        }
      }
    }

    return Promise.resolve()
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
    let maxAssetSize = 0
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
        const styledAssetName = chalk.reset.bold(firstAssetNamePart) + chalk.gray('.' + secondAssetNamePart);

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

  write (text: string) {
    process.stderr.write(text);
  }

  newLine (numberOfNewLines = 1) {
    process.stderr.write('\n'.repeat(numberOfNewLines));
  }

  clear () {
    process.stdout.write('\x1Bc');
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
