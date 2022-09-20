import { getByName, modifyAttr, modifyValueByName } from "./xml-utils";

export interface ProjectDefaultEslintAttrs {
  classAttr?: string
  enabled?: string
  level?: string
  enabledByDefault?: string
}

export const defaultModifiers = {
  projectDefaultEslint: (attrs:ProjectDefaultEslintAttrs = {}) => (json:any) => {
    const {
      classAttr = 'ESlint',
      enabled = 'true',
      level = 'WARNING',
      enabledByDefault = 'true',
    } = attrs

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
}
