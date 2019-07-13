
const Validate = $Validate;
/**
 * 表单数据验证
 * 
 * 通用的字段
 * require,dataType,handler,comment
 * 
 * isString时的字段
 * in(可选的值)，stringLength(字符串的长度范围，这里是一个数组，类似[2,5] 表示，字符串的长度为2到5，包含2和5 )
 * 
 * @param {array} -  需要进行检测对象数组，对象的结构为 {data:{string},handler:{function},require:{bool}}  data 为验证的数据，handler 为 验证的方法，require 为是否可以为空
 * @return {array} - 返回的结果 [{bool},{string}}] 例如[true,"验证通过"]、[false,"验证失败"]
 */
interface Task {
    require: boolean,
    data: any,
    msg: string,
    handler: any,
    dataType: any,
    defaultValue: any,
    in: string[],
    stringLength: string,//字符串型的取值范围[minLen,maxLen]
    numberRange: string,// 数值型的取值范围[min,max]
    exParams: any
}
const { isObject, isFunction, isString, isNumber, isArray, isBoolean } = $common.getType();
export default async (task: Array<Task>, data: object) => {

    if (!isArray(task)) {

        //return [false, ]
        throw new Error("validate 验证异常，请传入数组对象");
    }
    if (task.length == 0) {
        return true;
    }
    var result = {};// 返回的结果
    for (let i in task) {
        let t = task[i];
        if (!t.data) {
            // return [false, `第 ${i + 1} 个参数data字段不能为空`]
            throw new Error(`第 ${i + 1} 个参数data字段不能为空`);
        }
        t.require = (t.require == <any>'false' || t.require == <any>'0') ? false : Boolean(t.require);
        if (t.require) {

            //if ((!data[t.data]) || (data[t.data] == "undefined")) {
            if (data[t.data] === undefined || data[t.data] === "") {
                if (t.msg)
                    //return [false, `${t.msg}`]
                    throw new Error(`${t.msg}`);
                else
                    //return [false, `${t.data} 不能为空`]
                    throw new Error(`${t.data} 不能为空`);
            }
        }

        // 数据类型的检测
        if (t.dataType && (data[t.data] != undefined)) {
            if (t.dataType == 'isTransaction') {
                if (!isObject(data[t.data])) {
                    throw new Error(`数据验证方法异常：${t.data} 字段期望的数据类型是transaction `)
                }
                if (!data[t.data].commit || !data[t.data].rollback) {
                    throw new Error(`数据验证方法异常：${t.data} 不是一个有效的transaction对象 `)
                }
            }
            else {
                let func = $common.getType()[t.dataType];//[t.dataType](data[t.data] );
                //console.log(type,"type is ");
                if (!func) {
                    throw new Error(`数据验证方法 ${t.dataType}，不存在,支持的方法有 isArray isNumber isObject isBoolean isString isUndefined isNull isFunction isRegExp
                `)
                }
                if (t.dataType == 'isNumber') {
                    let tmp = Number(data[t.data]);
                    if (isNaN(tmp)) {
                        throw new Error(`${t.data} 数据验证失败，期望类型${t.dataType}`);
                    }

                    // 在这里做 判断，限定了取值的枚举，即使用了in属性，如果使用了in属性，则 numberRange 就不生效
                    if (t.numberRange && !t.in) {

                        let stringLength: any = eval(t.numberRange);
                        if (!isArray(stringLength)) {
                            throw new Error(`字段 ${t.data} 数据验证失败，numberRange 参数只支持数字数组，即[minLength,maxLength]您这里设置的值为${t.numberRange}`);
                        }
                        
                        if (stringLength.length != 2) {
                            throw new Error(`字段 ${t.data} 数据验证失败，numberRange只接受两个元素的，即最小值、最大值，您这里设置的值为${t.numberRange}`);
                        }
                        let len = Number(data[t.data]);
                        if (len < stringLength[0]) {
                            throw new Error(`字段 ${t.data} 数据验证失败，本字段的最小值为${stringLength[0]}, 您传入值为${len}`);
                        }

                        if (len > stringLength[1]) {
                            throw new Error(`字段 ${t.data} 数据验证失败，本字段的最大值为${stringLength[1]}, 您传入值的值为${len}`);
                        }

                    }

                }
                else if (t.dataType == 'isObject') {
                    if (typeof data[t.data] == 'string') {
                        try {
                            data[t.data] = JSON.parse(data[t.data]);
                        }
                        catch (err) {
                            throw new Error(`${t.data} 字段的数据可能不是标准的json字符串`);
                        }
                    }

                    let typeCheck = func(data[t.data]);
                }
                else {
                    let typeCheck = func(data[t.data]);
                    if (!typeCheck) {
                        throw new Error(`${t.data} 数据验证失败，期望类型${t.dataType},输入类型：${Object.prototype.toString.call(data[t.data])}`);
                    }

                    // 如果是字符串 还需要检测数据的长度
                    if (t.dataType == "isString") {
                        // 在这里做 判断，限定了取值的枚举，即使用了in属性，如果使用了in属性，则 stringLength就不生效
                        if (t.stringLength && !t.in) {

                            let stringLength: any = Number(t.stringLength);

                            if (isNumber(stringLength) && !isNaN(stringLength)) // 指定了字符串的长度
                            {
                                if (data[t.data].length != Number(t.stringLength)) {
                                    throw new Error(`字段 ${t.data} 数据验证失败，期望字符串长度为${t.stringLength},实际收入的长度为：${data[t.data].length}`);
                                }
                            }
                            else // 限定了范围的
                            {
                                stringLength = <number[]>eval(t.stringLength);
                                if (!isArray(stringLength)) {
                                    throw new Error(`字段 ${t.data} 数据验证失败，stringLength参数只支持数字或者数字数字，您这里设置的值为${t.stringLength}`);
                                }
                                if (stringLength.length != 2) {
                                    throw new Error(`字段 ${t.data} 数据验证失败，stringLength为数组时，只接受两个元素的，即最低长度、最高长度，您这里设置的值为${t.stringLength}`);
                                }
                                let len = data[t.data].length;
                                if (len < stringLength[0]) {
                                    throw new Error(`字段 ${t.data} 数据验证失败，本字段的最小长度为${stringLength[0]}, 您传入值的长度为为${len}`);
                                }

                                if (len > stringLength[1]) {
                                    throw new Error(`字段 ${t.data} 数据验证失败，本字段的最大长度为${stringLength[1]}, 您传入值的长度为为${len}`);
                                }

                            }
                        }
                    }
                }
            }

        }

        if (t.handler) {
            // 调用handle 方法
            let callHanler = async (func, _this, data, exParams) => {
                return await func.call(_this, data, exParams)
            }
            if (Validate == undefined || !Validate) {
                continue;
            }
            let getCheckFunc = (arr) => {
                if (!Validate[arr[0]]) {
                    throw new Error(`handler 模块 ${arr[0]} 不存在，你可能尚未导入该验证模块`)
                }
                let func = Validate[arr[0]][arr[1]]
                if (!func || !isFunction(func)) {
                    throw new Error(`handler 模块 ${arr[0]}中的${arr[1]}校验方法不存在 或者不是一个可用的函数`)
                }
                return func;
            }
            // 项目
            if (isFunction(t.handler)) {
                let res = await t.handler(data[t.data], t.exParams);
                if (!res[0]) {
                    //return res;
                    throw new Error(res[1]);
                }
                // 重新赋值
                if (res[2]) {
                    data[t.data] = res[2]
                }
            }
            else if (isString(t.handler)) {
                if (t.handler && (data[t.data] != undefined)) {
                    if (!data[t.data]) return [true]

                    if ((typeof t.handler) == "function") {
                        let res = await t.handler(data[t.data]);
                        if (!res[0]) {
                            //return res;
                            throw new Error(res[1]);
                        }
                        // 重新赋值
                        if (res[2]) {
                            data[t.data] = res[2]
                        }
                    }
                    else if ((typeof t.handler) == "string") {
                        let func = null;
                        let func_this = null
                        let splitStr = "@";
                        if (t.handler.indexOf(".") != -1) {
                            splitStr = "."
                        }
                        if (t.handler.indexOf(splitStr) != -1) {
                            let arr = t.handler.split(splitStr);
                            if (arr.length < 2) {
                                //return [false, "处理函数层级不合法"]
                                throw new Error("处理函数层级不合法");
                            }
                            if ((!arr[0]) || (!arr[1])) {
                                //return [false, "处理函数的层级数据不合法"]
                                throw new Error("处理函数的层级数据不合法");
                            }
                            func = getCheckFunc(arr);
                            func_this = Validate[arr[0]]
                        }
                        if (!func) {
                            //return [false, `${t.handler} handler 函数 未定义`]
                            throw new Error(`${t.handler} handler 函数 未定义`);
                        }
                        //console.log("func type is ", typeof func);
                        //let res = await func(data[t.data], t.exParams);
                        let res = await callHanler(func, func_this, data[t.data], t.exParams)
                        if (!res[0]) {
                            //return res;
                            throw new Error(res[1]);
                        }
                        // 重新赋值
                        if (res[2]) {
                            data[t.data] = res[2]
                        }
                    } else {
                        //return [false, `${t.data} handler 函数异常`]
                        throw new Error(`字段 ${t.data} 对应的handler：${t.handler} 函数异常,handler 支持string，和 异步校验函数`);
                    }

                }
            }
            else if (isArray(t.handler)) {
                for (let str of t.handler) {
                    let func = null;
                    let func_this = null;
                    let splitStr = "@";
                    if (str.indexOf(".") != -1) {
                        splitStr = "."
                    }
                    if (str.indexOf(splitStr) != -1) {
                        let arr = str.split(splitStr);
                        if (arr.length < 2) {
                            //return [false, "处理函数层级不合法"]
                            throw new Error("处理函数层级不合法");
                        }
                        if ((!arr[0]) || (!arr[1])) {
                            //return [false, "处理函数的层级数据不合法"]
                            throw new Error("处理函数的层级数据不合法");
                        }
                        //func = Validate[arr[0]][arr[1]]
                        func = getCheckFunc(arr);
                        func_this = Validate[arr[0]]
                    }
                    if (!func) {
                        //return [false, `${t.handler} handler 函数 未定义`]
                        throw new Error(`${str} handler 函数 未定义`);
                    }
                    //console.log("func type is ", typeof func);
                    //let res = await func.call(data[t.data], t.exParams);
                    let res = await callHanler(func, func_this, data[t.data], t.exParams)
                    if (!res[0]) {
                        //return res;
                        throw new Error(res[1]);
                    }
                    // 重新赋值
                    if (res[2]) {
                        data[t.data] = res[2]
                    }
                }
            }
            else {
                throw new Error(`字段 ${t.data} 对应的handler：${t.handler} 函数异常,handler 支持string，和 异步校验函数`)
            }
        }

        // 可选值范围检测
        if (t.in && data[t.data]) {
            if (!isArray(t.in)) {
                throw new Error(`${t.data} 字段 的 ${t.data} 的参数只支持数组`);
            }
            if (t.in.length > 0) {
                let set = new Set(t.in)
                if (!set.has(data[t.data])) {
                    throw new Error(`${t.data} 字段的值只可能是 ${t.in.toString()}`);
                }
            }
        }

        // 设置默认值
        if ((t.defaultValue != undefined) && (!data[t.data])) {
            result[t.data] = t.defaultValue;
        }
        else {
            if (data[t.data] != undefined) {
                result[t.data] = data[t.data];
            }
        }

    }
    return result;


}