/** 注册model层方法到系统常量*/
import { Model } from "@dpCore/Model"
import utils from "./utils";

var Models = new Map();
export default (models:Model[],application) => {

    if(!models || models.length == 0)
    {
        return console.log("未注册任何model");
    }
    for(let m of models)
    {
        Models.set(m['name'],m);
    }
    
    regGlobal('$model', async (name: string, params?: any) => {

        if(Models.size <= 0)
        {
            throw new Error("无法调用model,您没有注册任何model");
        }

        if (!name) throw new Error("无法调用model，因为name为空");
        let arr = name.split('.');
        if (!arr[0]) {
            throw new Error("无法调用model，因为model name 读取失败");
        }
        let modelClass = Models.get(arr[0]);
        if (!modelClass) {
            throw new Error(`${arr[0]} 可能不存在`);
        }
        let lg = new modelClass({});//model.get(`${arr[0]}.Model`);
        lg.App = application;
        if (!arr[1]) {
            throw new Error("无法调用model，因为model 方法读取失败");
        }
        //console.log(lg,'model instance ');
        let fn = lg[arr[1]]
        if (!fn) throw new Error(`model方法 ${arr[1]} 不存在`);
        let init = lg['_init'];
        if (init) {
            params = await init(arr[1], params);
        }
        // 输入值 和 输出值的校验我
        let inputRule = null;
        let returnRule = null;
        if (lg.$Meta && lg.$Meta.actionInputRuleset) {
            inputRule = lg.$Meta.actionInputRuleset.get(arr[1]);
        }
        if (lg.$Meta && lg.$Meta.actionReturnsRule) {
            returnRule = lg.$Meta.actionReturnsRule.get(arr[1]);
        }
        if (inputRule) {
            try {
                // 检测输入的参数
                await utils.inputChecker1(params, inputRule)
            }
            catch (err) {
                throw new Error(`调用${arr[0]}.Model 的 ${arr[1]} 方法时，输入参数检测失败，异常信息：${err.message}`)
            }

        }
        let result = await fn.call(lg, params)
        if (returnRule) {

            try {
                // 检测输出的参数
                await utils.inputChecker1(result, returnRule)
            }
            catch (err) {
                throw new Error(`调用${arr[0]}.Model 的 ${arr[1]} 方法时，输出参数检测失败，异常信息：${err.message}`)
            }
        }
        return result;
    })
}