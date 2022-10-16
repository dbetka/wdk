Init Intellij Settings
==================

[← Go back](../README.md)

>  ### Table of content:
>  * [Purpose](#purpose)
>  * [Usage examples](#usage-examples)

Purpose
---------

Default config for automate initialization project settings process for new instances of project or new developers.

Usage examples
----------------

```js
const { initIntellijSettings } = require('@dbetka/wdk/lib/ide/init-intellij-settings');
const { defaultConfigs } = require('@dbetka/wdk/lib/ide/defaults');

initIntellijSettings(defaultConfigs({
  codeStylesSchemePath: './idea-default/code-styles-scheme.xml',
  webpackPath: '$PROJECT_DIR$/client/webpack/config.common.js',
}));
```
