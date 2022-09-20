import {XMLUtils} from "./xml-utils";

const getByName = XMLUtils.getByName

export const defaultValidators = {
  projectDefaultEslint: () => (json:any) => {
    if (json.component === undefined) return true;

    const profile = json.component.profile[0];

    return profile === undefined ||
      profile.inspection_tool[0] === undefined;
  },
  eslintOnSave: () => (json:any) =>
    json.project === undefined ||
    json.project.component === undefined ||
    Array.isArray(getByName(json.project.component, 'EslintConfiguration').option) === false,
  webpack: () => (json:any) =>
    json.project === undefined ||
    json.project.component === undefined ||
    Array.isArray(getByName(json.project.component, 'WebPackConfiguration').option) === false
}
