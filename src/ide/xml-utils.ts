
export function getByName (list:[any], name:string) {
  return list.find(({ $ }) => $.name === name)
}

export function modifyValueByName (list:[any], name:string, value:string) {
  list.find(({ $ }) => $.name === name).$.value = value
}

export function modifyAttr (tag:any, attr:string, value:string) {
  tag.$[attr] = value
}
