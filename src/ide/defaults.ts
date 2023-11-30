import { getByName, modifyAttr, modifyValueByName } from './xml-utils.js';

export const defaultValidators = {
  projectDefaultEslint: () => (json:any) => {
    if (json.component === undefined)
      return false;

    const profile = json.component.profile[0];
    return profile !== undefined
      && profile.inspection_tool[0] !== undefined;
  },
  eslintOnSave: () => (json:any) =>
    json.project !== undefined
    && json.project.component !== undefined
    && Array.isArray(getByName(json.project.component, 'EslintConfiguration').option),

  webpack: () => (json:any) =>
    json.project !== undefined
    && json.project.component !== undefined
    && Array.isArray(getByName(json.project.component, 'WebPackConfiguration').option)
};

export interface ProjectDefaultEslintAttrs {
  classAttr?: string;
  enabled?: string;
  level?: string;
  enabledByDefault?: string;
}

export const defaultModifiers = {
  projectDefaultEslint: (attrs:ProjectDefaultEslintAttrs = {}) => (json:any) => {
    const {
      classAttr = 'ESlint',
      enabled = 'true',
      level = 'WARNING',
      enabledByDefault = 'true',
    } = attrs;

    const profile = json.component.profile[0];
    const inspectionTool = profile.inspection_tool[0];

    modifyAttr(inspectionTool, 'class', classAttr);
    modifyAttr(inspectionTool, 'enabled', String(enabled));
    modifyAttr(inspectionTool, 'level', level);
    modifyAttr(inspectionTool, 'enabled_by_default', enabledByDefault);

    return json;
  },
  eslintOnSave: ({ enabled = 'true' }) => (json:any) => {
    const component = getByName(json.project.component, 'EslintConfiguration');
    modifyValueByName(component.option, 'fix-on-save', enabled);

    return json;
  },
  webpack: ({ dir = '' }) => (json:any) => {
    const component = getByName(json.project.component, 'WebPackConfiguration');
    modifyValueByName(component.option, 'mode', 'MANUAL');
    modifyValueByName(component.option, 'path', dir);

    return json;
  },
};

export interface ConfigsModifications {
  webpackPath: string;
  codeStylesSchemePath: string;
}

export const defaultConfigs = (modifications:ConfigsModifications) => [
  {
    name: 'Code style config',
    defaultXMLPath: './node_modules/@dbetka/wdk/share/ide/code-styles-config.xml',
    targetXMLPath: './.idea/codeStyles/codeStyleConfig.xml',
    replaceIfExists: true,
  },
  {
    name: 'Code style scheme',
    defaultXMLPath: modifications.codeStylesSchemePath,
    targetXMLPath: './.idea/codeStyles/Project.xml',
    replaceIfExists: true,
  },
  {
    name: 'EsLint',
    defaultXMLPath: './node_modules/@dbetka/wdk/share/ide/eslint.xml',
    targetXMLPath: './.idea/inspectionProfiles/Project_Default.xml',
    validator: defaultValidators.projectDefaultEslint(),
    modifier: defaultModifiers.projectDefaultEslint(),
    replaceIfTargetInvalid: true,
  },
  {
    name: 'ESLint on save',
    defaultXMLPath: './node_modules/@dbetka/wdk/share/ide/eslint-on-save.xml',
    targetXMLPath: './.idea/jsLinters/eslint.xml',
    validator: defaultValidators.eslintOnSave(),
    modifier: defaultModifiers.eslintOnSave({ enabled: 'true' }),
    replaceIfTargetInvalid: true,
  },
  {
    name: 'Webpack',
    defaultXMLPath: './node_modules/@dbetka/wdk/share/ide/webpack.xml',
    targetXMLPath: './.idea/misc.xml',
    validator: defaultValidators.webpack(),
    modifier: defaultModifiers.webpack({ dir: modifications.webpackPath }),
    replaceIfTargetInvalid: true,
  },
];
