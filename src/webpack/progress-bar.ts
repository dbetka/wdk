import chalk from 'chalk';
import * as ProgressBar from 'progress';
import * as webpack from 'webpack';

declare interface ProgressBarPluginOptionsType {
  format?: string;
  renderThrottle: number;
  total?: number;
  width: number;
  complete: string;
  incomplete: string;
  stream: typeof process.stdout;
  clear: boolean;
  summary?: boolean;
  summaryContent?: string;
  customSummary?(buildTime?:string): void;
}

export declare interface ProgressBarPluginType {
  plugin: webpack.ProgressPlugin | undefined;
  stop(): void;
  start(): void;
}

export function progressBarPlugin (webpackExternal: typeof webpack, config: { linesBeforeBar: number } = { linesBeforeBar: 0 }): ProgressBarPluginType {
  const options: ProgressBarPluginOptionsType = {
    format: `  Build ${chalk.bgGray(':bar')} ${chalk.green.bold(':percent')} `,
    renderThrottle: 100,
    total: 200,
    width: 30,
    complete: '█',
    incomplete: ' ',
    stream: process.stdout,
    clear: false,
    summary: false,
    customSummary: () => undefined,
  };

  const stream = options.stream || process.stderr;
  if (!stream.cursorTo) stream.cursorTo = ():boolean => true;
  const enabled = stream && stream.isTTY;

  const progressBarPosition = [0, 4 + config.linesBeforeBar] as const;

  if (!enabled) {
    let displayEmergencyProgress = false;
    const emergencyPlugin = new webpackExternal.ProgressPlugin((percent) => {
      if (displayEmergencyProgress) {
        stream.cursorTo(...progressBarPosition);
        stream.clearLine && stream.clearLine(0);
        stream.write('  Build  ' + chalk.green.bold(`${Math.round(percent * 100)}% `));
        stream.cursorTo(...progressBarPosition);
      }
    });

    return {
      plugin: emergencyPlugin,
      stop: () => (displayEmergencyProgress = false),
      start: () => (displayEmergencyProgress = true),
    };
  }

  const barLeft = chalk.bold('[');
  const barRight = chalk.bold(']');
  const preamble = chalk.cyan.bold('  build ') + barLeft;
  const barFormat = options.format || preamble + ':bar' + barRight + chalk.green.bold(' :percent');
  const summary = options.summary;
  const summaryContent = options.summaryContent;
  const customSummary = options.customSummary;

  delete options.format;
  delete options.total;
  delete options.summary;
  delete options.summaryContent;
  delete options.customSummary;

  const barOptions = Object.assign({
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 100,
    clear: true,
  }, options);

  const bar = new ProgressBar(barFormat, barOptions);

  let running = false;
  let stopDisplaying = false;
  let startTime = 0;
  let lastPercent = 0;

  const plugin = new webpackExternal.ProgressPlugin((percent, msg) => {
    if (stopDisplaying) {
      return;
    }

    if (!running && lastPercent !== 0 && !customSummary) {
      stream.write('\n');
    }

    const newPercent = Math.floor(percent * barOptions.width);

    if (lastPercent < percent || newPercent === 0) {
      lastPercent = percent;
    }

    stream.cursorTo(...progressBarPosition);

    bar.update(percent, {
      msg,
    });

    stream.cursorTo(...progressBarPosition);

    if (!running) {
      running = true;
      startTime = Date.now();
      lastPercent = 0;
    } else if (percent === 1) {
      const now = Date.now();
      const buildTime = (now - startTime) / 1000 + 's';

      bar.terminate();

      if (summary) {
        stream.write(chalk.green.bold('Build completed in ' + buildTime + '\n\n'));
      } else if (summaryContent) {
        stream.write(summaryContent + '(' + buildTime + ')\n\n');
      }

      if (customSummary) {
        customSummary(buildTime);
      }

      running = false;
    }
  });

  return {
    plugin,
    stop: () => (stopDisplaying = true),
    start: () => (stopDisplaying = false),
  };
}
