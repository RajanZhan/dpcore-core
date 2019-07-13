/**
 * 创世纪 文件，在这里了整套框架的 基础 代码
 * 
 */


 /**
  * 创世纪类
  */
class OriginClass {

}

/**
 * 输入参数校验的注解
 * @param input 
 */
const Params = (input)=>{
    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});
        if (!target.$Meta.actionInputRuleset) {
            target.$Meta.actionInputRuleset = new Map();
        }
        target.$Meta.actionInputRuleset.set(methodName, input);
    }
}

/**
 * 返回参数校验的注解
 * @param input 
 */
const Returns =(returns)=>{
    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});
        if (!target.$Meta.actionReturnsRule) {
            target.$Meta.actionReturnsRule = new Map();
        }
        target.$Meta.actionReturnsRule.set(methodName, returns);
    }
}

/**
 * 方法描述的注解
 * @param input 
 */
const Desc =(info)=>{
    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});
        if (!target.$Meta.actionDescInfo) {
            target.$Meta.actionDescInfo = new Map();
        }
        target.$Meta.actionDescInfo.set(methodName, info);
    }
}

export {
    OriginClass,
    Params,
    Returns,
    Desc,
}
