#!/usr/bin/env node

import {exec} from "child_process";

if (process.argv) {
  const [interpreter, script, ...args] = process.argv;

  exec('npx ' + args.join(' '));
}
