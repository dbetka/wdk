Init Intellij Settings
==================

[← Go back](../README.md)

>  ### Table of content:
>  * [Purpose](#purpose)
>  * [What provides](#what-provides)
>  * [Usage examples](#usage-examples)
>  * [Available configuration](#available-configuration)
>  * [Descriptions and visualisations](#descriptions-and-visualisations)
>    + [Description of base behavior](#description-of-base-behavior)
>    + [Error handling](#error-handling)

Purpose
---------

Automate initialization project settings process for new instances or new developers.

What provides
---------------

* Possibility to validate and modify XML files in Intellij projects configuration – `.idea` directory.
* Possibility to set default XML configuration 

Usage examples
----------------

```js
const { initIntellijSettings } = require('@dbetka/wdk/lib/ide/init-intellij-settings');

initIntellijSettings([
  {
    name: 'ESLint',
    defaultXMLPath: './ide-default/default-eslint.xml',
    targetXMLPath: './.idea/jsLinters/eslint.xml',
    validator: json =>
      json === null ||
      json.project === undefined ||
      json.project.component === undefined ||
      Array.isArray(json.project.component[0].option) === false,
    modifier: json => {
      const option = json.project.component[0].option;

      option.find(({ $: { name } }) => name === 'fix-on-save').$.value = 'true';

      return json;
    },
  },
  {
    name: 'Webpack',
    defaultXMLPath: './ide-default/default-misc.xml',
    targetXMLPath: './.idea/misc.xml',
    validator: json =>
      json === null ||
      json.project === undefined ||
      json.project.component === undefined ||
      Array.isArray(json.project.component[0].option) === false,
    modifier: json => {
      const option = json.project.component[0].option;

      option.find(({ $: { name } }) => name === 'mode').$.value = 'MANUAL';
      option.find(({ $: { name } }) => name === 'path').$.value = '$PROJECT_DIR$/client/webpack/config.common.js';

      return json;
    },
  },
]);

```

Available configuration
-------------------------

| Name               | Type     | Description                                            |
|--------------------|----------|--------------------------------------------------------|
| **name**           | string   | Name of modifying configuration.                       |
| **defaultXMLPath** | string   | Path to XML file with default configuration.           |
| **targetXMLPath**  | string   | Path to XML file with current configuration.           |
| **validator**      | function | Function to validate current configuration XML file.   |
| **modifier**       | function | Function to modify current configuration XML file.     |


Descriptions and visualisations
----------------------------------

### Description of base behavior

After run plugin clears console and displays title bar with plugin name.
Then displays name of modifying configuration, state of it (done or failed) and modified path file if success.
It happens for each configuration being modifying.
If all configurations have been modified successfully plugin displays `All done!` message and stops.

![](init-intellij-settings/1.png "Run plugin successfully")

### Error handling

If while modifying process error occurred plugin displays all information below name of modifying configuration.
After error occur plugin just stops.

![](init-intellij-settings/2.png "Example error")

