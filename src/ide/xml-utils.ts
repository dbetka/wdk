
export const XMLUtils = {
  getByName(list:[any], name:string) {
    return list.find(({ $ }) => $.name === name)
  },
  modifyValueByName(list:[any], name:string, value:string) {
    list.find(({ $ }) => $.name === name).$.value = value
  },
  modifyAttr(tag:any, attr:string, value:string) {
    tag.$[attr] = value
  },
}
