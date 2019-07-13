
const fs = require("fs");
const path = require("path")
const uuidv1 = require('uuid/v4');
// 读取数据对象的真实数据类型
const getType = () => {
    let isArray = (o) => {
        return Object.prototype.toString.call(o) == '[object Array]';
    };
    let isNumber = (o) => {
        return Object.prototype.toString.call(o) == '[object Number]';
    };

    let isObject = (o) => {
        return Object.prototype.toString.call(o) == '[object Object]';
    };
    let isBoolean = (o) => {
        return Object.prototype.toString.call(o) == '[object Boolean]';
    };

    let isString = (o) => {
        return Object.prototype.toString.call(o) == '[object String]';
    };

    let isUndefined = (o) => {
        return Object.prototype.toString.call(o) == '[object Undefined]';
    };

    let isNull = (o) => {
        return Object.prototype.toString.call(o) == '[object Null]';
    };

    let isFunction = (o) => {
        return (Object.prototype.toString.call(o) == '[object Function]' || Object.prototype.toString.call(o) == '[object AsyncFunction]');
    };

    let isDate = (o) => {
        return Object.prototype.toString.call(o) == '[object Date]';
    };
    let isRegExp = (o) => {
        return Object.prototype.toString.call(o) == '[object RegExp]';
    };

    let isEmptyObject = (o) => {
        for (var key in o) {
            return false
        };
        return true
    };

    return {
        isArray,
        isNumber,
        isObject,
        isBoolean,
        isString,
        isUndefined,
        isNull,
        isFunction,
        isRegExp,
        isEmptyObject,
        isDate
    }
}

/**
 * 生成指定位数的 随机数字
 * @param size 位数
 * @returns {number}. 返回字符串
 */
const getRandomNum = (size: number) => {

    var seed = new Array('1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
    );//数组
    let seedlength = seed.length;//数组长度
    var createPassword = '';
    for (let i = 0; i < size; i++) {
        let j = Math.floor(Math.random() * seedlength);
        createPassword += seed[j];
    }
    return Number(createPassword);
}

// 递归创建文件夹
const mkdirsSync = (dirname) => {
    const path = require("path");
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

const { isEmptyObject, isObject, isString, isArray, isDate } = getType();

/**
 * 
 * @param input 可能是数组 ，可能是 对象，可能是基础数据类型
 * @param rules 可能是数组 ，可能是 对象，字符串
 */
const inputChecker1 = async (input, rules) => {

    // 如果input === false 则无需校验
    if (input === false) {
        return input;
    }
    // 都是空对象，无需校验
    if (isEmptyObject(input) && isEmptyObject(rules)) {
        return input;
    }
    // if (!isEmptyObject(rules) && isEmptyObject(input)) {
    //     throw new Error("本接口不接受空参数");
    // }
    let map = new Map();
    var inputMap = new Map();
    let checkerRules = [];
    let checkData = {};

    const getValidateObjectByStr = (rule) => {
        let checkerObj = [];
        if (!rule) {
            return checkerObj;
        }
        let ruleArr = [];
        try {
            ruleArr = rule.split('&');
        }
        catch (err) {
            throw err
        }

        if (ruleArr.length > 0) {
            // 构建校验参数
            for (let i of ruleArr) {
                if (!i) {
                    continue;
                }
                if (isObject(i)) {
                    continue;
                }
                let arr = i.split('=');
                if (arr.length == 2) {
                    if (arr[0] == 'exParams') {
                        checkerObj[arr[0]] = input[arr[1]]; //  的exParams 的参数 这里就变成了 整个input的字段的键
                    }
                    else if (arr[0] == 'in') {
                        checkerObj[arr[0]] = eval(arr[1]);
                    }
                    else {
                        checkerObj[arr[0]] = arr[1]
                    }
                }
            }
        }
        return checkerObj
    }



<<<<<<< HEAD
=======

    // if (isArray(rules)) {
    //     // if(!isArray(input))
    //     // {
    //     //     throw new Error(`规则输出期望为array类型，但对应输出并不是array`);
    //     // }
    //     rules = rules[0]
    // }

>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6
    for (let i in rules) {
        if (!i) {
            continue;
        }
        map.set(i, rules[i])// 字段和字段的规则做映射
        let rule = rules[i];
        let checkerObj = {};
        if (rule) {

            /**
             * 到这一步，规则只能是两种数据类型 string 、object，因为数组已经被截取了第一个数组作为规则对象
             */
            let ruleIsString = isString(rule);
            let ruleIsObjectiso = isObject(rule);
            let ruleIsArray = isArray(rule);

            // 如果规则是string，现将规则解析成对象
            if (ruleIsString) {

                let ruleObj = getValidateObjectByStr(rule)
                if (isArray(input[i])) {
                    throw new Error(`字段${i}期望的数据类型是${ruleObj['dataType']}，但传入了数组`);
                }
                if (isObject(input[i])) {
                    throw new Error(`字段${i}期望的数据类型是${ruleObj['dataType']}，但传入了对象`);
                }
                ruleObj['data'] = i;
                checkerRules.push(ruleObj);
                checkData[i] = input[i];
            }
            else if (ruleIsObjectiso || ruleIsArray) {
                if (ruleIsArray) {
                    rule = rule[0]
                }
                // 这个参数为必填参数
                if (rule.require) {
                    if (!input[i]) {
                        throw new Error(`参数${i}为必填参数，请传入参数`);
                    }
                }
                /**
                 * 传入的数据只能是对象或者对象数组
                 */
                if (!isArray(input[i]) && !isObject(input[i])) {
                    throw new Error(`字段${i}期望的数据数组或者对象数组，但传入的数据都不符合`);
                }
                //如果规则是对象，那么，规则的数据结构一定为{require:<boolean>,attr:{  }},attr为 参数规则，可以递归
                if (!rule.attr || !isObject(rule.attr)) {
                    throw new Error(`校验${i}规则数据结构不合法，attr 属性必须存在并且attr为object类型`);
                }
                if (ruleIsArray && !isArray(input[i])) {
                    throw new Error(`校验${i}规则期望数据为数组，但传入的值不是数组`);
                }

                if (ruleIsObjectiso && !isObject(input[i])) {
                    throw new Error(`校验${i}规则期望数据为object，但传入的值不是object`);
                }

                // 如果传入的是数组，需要for循环处理
                if (isArray(input[i])) {
                    for (let j in input[i]) {
                        if (input[i][j]) {
                            input[i][j] = await inputChecker1(input[i][j], rule.attr)
                        }
                    }
                }
                else {
                    input[i] = await inputChecker1(input[i], rule.attr)
                }

            }
            else {
                throw new Error("参数校验规则只支持string 和 object，您传入的规则为" + rule);
            }

        }
    }


    // 确保传进来的参数，是规则期望的参数
    for (let j in input) {
        if (!j || j == "") //存在键不合法的属性
        {
            throw new Error("参数校验失败,接收了键值为空的参数:" + j);
        }
        if (!map.has(j)) {
            throw new Error("参数校验失败,接收了不期望的参数:" + j);
        }
        if (isObject(input[j])) {
            if (!isObject(rules[j])) {
                let checkerObj = {}
                checkerObj = getValidateObjectByStr(rules[j]);

                // 这里可以是transaction
                if (!(checkerObj['dataType'] && checkerObj['dataType'] == "isTransaction")) {
                    throw new Error(`字段${j}为object类型，但对应校验规则并不是object`);
                }
                continue;
            }
            input[j] = await inputChecker1(input[j], rules[j].attr)

        }
        else if (isArray(input[j])) {
            if (!isArray(rules[j])) {
                throw new Error(`字段${j}为array类型，但对应校验规则并不是array`);
            }
            if (!rules[j][0]) {
                throw new Error(`字段${j}为array类型，但对应校验规则数组为空`);
            }
            if (!isObject(rules[j][0])) {
                throw new Error(`字段${j}为array类型，但对应校验规则数组的第一个元素不是对象`);

            }

            if (rules[j].attr) {
                input[j] = await inputChecker1(input[j], rules[j].attr)
            }
            else {
                input[j] = await inputChecker1(input[j], rules[j])
            }

        }
        // else
        // {
        //     input[j] = await inputChecker1(input, rules)
        // }

        inputMap.set(j, input[j]);

    }


    //开始校验
    await $dataChecker(checkerRules, input)
    return input;


}

// 根据输入的数据以及规则校验数据的合法性
const inputChecker = async (input, rules) => {

    // 如果input === false 则无需校验
    if (input === false) {
        return input;
    }
    // 都是空对象，无需校验
    if (isEmptyObject(input) && isEmptyObject(rules)) {
        return input;
    }
    // if (!isEmptyObject(rules) && isEmptyObject(input)) {
    //     throw new Error("本接口不接受空参数");
    // }
    let map = new Map();
    var inputMap = new Map();
    let checkerRules = [];

    const getValidateObjectByStr = (rule, checkerObj) => {
        if (!rule) {
            return checkerObj;
        }
        let ruleArr = rule.split('&');
        if (ruleArr.length > 0) {
            // 构建校验参数
            for (let i of ruleArr) {
                if (!i) {
                    continue;
                }
                if (isObject(i)) {
                    continue;
                }
                let arr = i.split('=');
                if (arr.length == 2) {
                    if (arr[0] == 'exParams') {
                        checkerObj[arr[0]] = input[arr[1]]; //  的exParams 的参数 这里就变成了 整个input的字段的键
                    }
                    else if (arr[0] == 'in') {
                        checkerObj[arr[0]] = eval(arr[1]);
                    }
                    else {
                        checkerObj[arr[0]] = arr[1]
                    }
                }
            }
        }
        return checkerObj
    }

    if (isArray(rules)) {
        // if(!isArray(input))
        // {
        //     throw new Error(`规则输出期望为array类型，但对应输出并不是array`);
        // }
        rules = rules[0]
    }

    for (let i in rules) {
        if (!i) {
            continue;
        }
        map.set(i, rules[i])
        let rule = rules[i];
        let checkerObj = {};
        if (rule) {
            if (isArray(input)) {
                // 规则是对象 
                // 规则是对象 
                if (isObject(rule)) {
                    for (let ia in input) {
                        try {
                            input[ia][i] = await inputChecker(input[ia][i], rule) // 输入的是每个数组的元素，一般情况是 对象，规则是一个对象，如果输入的是非对象类型，怎么来处理？

                        }
                        catch (err) {
                            throw new Error(`校验字段${i}时，出现异常，${err.message}`)
                        }
                    }
                }

                if (isArray(rule)) {
                    for (let ia in input) {
                        try {
                            input[ia][i] = await inputChecker(input[ia][i], rule[0])
                        }
                        catch (err) {
                            throw new Error(`校验字段${i}时，出现异常，${err.message}`)
                        }
                    }

                }
                if (!isString(rule)) {
                    continue;
                }
                checkerObj = getValidateObjectByStr(rule, checkerObj);
            }
            else if (isObject(input)) {
                // 规则是对象 
                if (isObject(rule)) {
                    if (!isObject(input[i])) {
                        throw new Error(`规则${i}为object类型，但对应输出并不是object,输出的数据为${JSON.stringify(input[i])}`);
                    }
                    try {
                        input[i] = await inputChecker(input[i], rule)

                    }
                    catch (err) {
                        throw new Error(`校验字段${i}时，出现异常，${err.message}`)
                    }
                }

                if (isArray(rule)) {
                    for (let j in input[i]) {
                        input[i][j] = await inputChecker(input[i][j], rule[0])
                    }

                }
                if (!isString(rule)) {
                    continue;
                }
                checkerObj = getValidateObjectByStr(rule, checkerObj);
            }
            else if (isDate(input)) {
                // 规则是对象 
                if (isObject(rule)) {
                    if (!isObject(input[i])) {
                        throw new Error(`规则${i}为object类型，但对应输出期望是date类型 输出的数据为${JSON.stringify(input[i])}`);
                    }
                    input[i] = await inputChecker(input[i], rule)
                }

                if (isArray(rule)) {
                    for (let j in input[i]) {
                        input[i][j] = await inputChecker(input[i][j], rule[0])
                    }

                }
                if (!isString(rule)) {
                    continue;
                }
                checkerObj = getValidateObjectByStr(rule, checkerObj);
            }
            else {
                console.log(rule, input)
                throw new Error(`无法处理的异常`);
            }
        }
        checkerObj['data'] = i;
        checkerRules.push(checkerObj)
    }

    if (isArray(input)) {
        // if(!isArray(rules))
        // {
        //     throw new Error(`输出为array类型，但对应规则并不是array`);
        // }
        for (let i in input) {
            input[i] = await inputChecker(input[i], rules)
        }
    }
    else {
        for (let j in input) {
            if (!j || j == "") //存在键不合法的属性
            {
                throw new Error("参数校验失败,接收了键值为空的参数:" + j);
            }
            if (isObject(input[j])) {
                if (!isObject(rules[j])) {
                    let checkerObj = {}
                    checkerObj = getValidateObjectByStr(rules[j], checkerObj);

                    // 这里可以是transaction
                    if (!(checkerObj['dataType'] && checkerObj['dataType'] == "isTransaction")) {
                        throw new Error(`字段${j}为object类型，但对应校验规则并不是object`);
                    }
                    continue;
                }
                input[j] = await inputChecker(input[j], rules[j])
            }
            inputMap.set(j, input[j]);
            if (!map.has(j)) {
                throw new Error("参数校验失败,接收了不期望的参数:" + j);
            }
        }
        await $dataChecker(checkerRules, input)
        return input;
    }

}


/*
* @description    根据某个字段实现对json数组的排序
* @param   array  要排序的json数组对象
* @param   field  排序字段（此参数必须为字符串）
* @param   reverse 是否倒序（默认为false）
* @return  array  返回排序后的json数组
*/
function jsonSort(array, field, reverse) {
    //数组长度小于2 或 没有指定排序字段 或 不是json格式数据
    if (array.length < 2 || !field || typeof array[0] !== "object") return array;
    //数字类型排序
    if (typeof array[0][field] === "number") {
        array.sort(function (x, y) { return x[field] - y[field] });
    }
    //字符串类型排序
    if (typeof array[0][field] === "string") {
        array.sort(function (x, y) { return x[field].localeCompare(y[field]) });
    }
    //倒序
    if (reverse) {
        array.reverse();
    }
    return array;
}

// 生成md5
const md5 = (str: string) => {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex')
}

/**
  * 生成随机id
  * @returns {string}. 返回字符串
  */
const getId = () => {
    return md5(new Date().getTime() + getRandomString())
}

/**
 * 生成随机任意长度的字符串
 * @returns {string}. 返回字符串
 */
const getRandomString = () => {
    return uuidv1();
}


/**
* 数组分页
* @params {array} arr 目标数据
* @params {number} page 读取的页数
* @params {number} size 每页的数据
*/
const arrayPage = (arr, page, size) => {
    if (!arr || arr.length <= 0) {
        return [];
    }
    var length = arr.length;
    var newArr = [];
    var i = Math.ceil(length / size * 1.0);
    var j = 0;
    while (j < i) {
        var spare = length - j * size >= size ? size : length - j * size;
        var temp = arr.slice(j * size, j * size + spare);
        newArr.push(temp); j++;
    }
    return newArr[page - 1];
}

// 比较两个数值数据的数据类型是否相等
const compareDataType = (a, b) => {
    return Object.prototype.toString.call(a) == Object.prototype.toString.call(b)
}


/**
 *  读取系统的绝对路径
 */
const getAbsolutePath = (dir?: string) => {
    if ($config.debug == 1) {
        return path.join($rootPath, '../src/', dir).replace(/\/\//g, '/')
    }
    else {
        return path.join($rootPath, dir).replace(/\/\//g, '/')
    }
}

<<<<<<< HEAD
const dateFormate = (date: Date | number, fmt: string): string => {
    var dd = new Date(date);
    function d(fmt): string { //author: meizz 
        var o = {
            "M+": dd.getMonth() + 1, //月份 
            "d+": dd.getDate(), //日 
            "h+": dd.getHours(), //小时 
            "m+": dd.getMinutes(), //分 
            "s+": dd.getSeconds(), //秒 
            "q+": Math.floor((dd.getMonth() + 3) / 3), //季度 
            "S": dd.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dd.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    return d(fmt);

}
=======
>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6

export default {


    getRandomString,
    getRandomNum,
    getId,
    arrayPage,
    mkdirsSync,
    jsonSort,
    md5,
    getType,
    inputChecker,
    inputChecker1,
    compareDataType,
    getAbsolutePath,
<<<<<<< HEAD
    dateFormate,
=======

>>>>>>> 1e74a50bef6cd759584fa18b6d30caf1972162c6

}