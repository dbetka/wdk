import { getByName } from "./xml-utils";

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
}
