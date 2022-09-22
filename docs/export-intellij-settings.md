Export Intellij Settings
==================

[← Go back](../README.md)

>  ### Table of content:
>  * [Purpose](#purpose)
>  * [What provides](#what-provides)
>  * [Node usage examples](#node-usage-examples)
>  * [CLI usage examples](#cli-usage-examples)

Purpose
---------

Simple utilities to copy specific config files from `.idea` to specified destination.

What provides
---------------

* Copy specific config file from `.idea` to specified destination.
* Use defined methods to copy popular files.

Node usage examples
----------------

```js
const { 
  exportSpecific, 
  exportCodeStyleScheme,
  exportCodeStyleConfig,
  exportWebpack,
  exportESLint,
  exportESLintOnSave,
} = require('../../wdk/lib/ide/export-intellij-settings');

// specific config file
exportSpecific({
  src: './.idea/codeStyles/Project.xml',
  dest: './idea-default/code-styles/scheme.xml',
})

// defined methods to copy popular files
exportCodeStyleScheme('./idea-default/code-styles/scheme.xml')
exportCodeStyleConfig('./idea-default/code-styles/config.xml')
exportWebpack('./idea-default/webpack.xml')
exportESLint('./idea-default/eslint.xml')
exportESLintOnSave('./idea-default/eslint-on-save.xml')
```


CLI usage examples
----------------

```
usage: npx export-intellij-settings <method> [<args>]

List of methods:
  specific
    npx export-intellij-settings specific <src> <dest>

  codeStyleScheme – src: ./.idea/codeStyles/Project.xml
    npx export-intellij-settings codeStyleScheme <dest>

  codeStyleConfig – src: ./.idea/codeStyles/Project.xml
    npx export-intellij-settings codeStyleConfig <dest>

  webpack – src: ./.idea/misc.xml
    npx export-intellij-settings webpack <dest>

  eslint – src: ./.idea/inspectionProfiles/Project_Default.xml
    npx export-intellij-settings eslint <dest>

  eslintOnSave – src: ./.idea/jsLinters/eslint.xml
    npx export-intellij-settings eslintOnSave <dest>
```
