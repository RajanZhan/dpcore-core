/**
 *  读取本系统的api接口信息
 * import apireader from "../middleware/apiReader.middle"
 * apireader(app)
 */
export default (app) => {
    app.get("/_DEBUG_/api/list", (req, res, next) => {
        let list = [];
        if ($controllerApis) {
            for (let i of $controllerApis.keys()) {
                list.push({
                    "接口地址": i,
                    "接口描述": $controllerApis.get(i)
                })
            }
        }
        res.json(list);
    })
    app.get("/_DEBUG_/api/get", (req, res, next) => {
        let info = null;
        if ($controllerApis) {
            info = $controllerApis.get(req.query.api)
        }
        res.json(info);
    })
    //读取model 列表
    app.get("/_DEBUG_/model/list", (req, res, next) => {
        let list = [];
        if ($build.model) {
            for (let i in $build.model) {
                if (i) {
                    let arr = i.split('.');
                    let modelClass = $build.model[i].default
                    if (!modelClass) {
                        continue;
                    }
                    let modelInfo = <any>{}
                    //new $build.model[l].default({});
                    let lg = new modelClass({});//model.get(`${arr[0]}.Model`);
                    let modelAction = [];

                    modelInfo.model = arr[0]

                    if ($build.model[i].default.prototype.$Meta) {
                        let cls = $build.model[i].default.prototype;
                        let keys = cls.$Meta.actionInputRuleset.keys()
                        for (let para of keys) {
                            modelAction.push(
                                {
                                    方法名: para,
                                    调用:`await $model("${arr[0]}.${para}",data)`,
                                    描述: cls.$Meta.actionDescInfo?cls.$Meta.actionDescInfo.get(para):"",
                                    输入参数: cls.$Meta.actionInputRuleset?cls.$Meta.actionInputRuleset.get(para):"",
                                    返回值: cls.$Meta.actionReturnsRule?cls.$Meta.actionReturnsRule.get(para):"",
                                }
                            )
                        }

                    }

                    modelInfo.model方法列表 = modelAction;

                    list.push(modelInfo)
                }

            }
        }
        res.json(list);
    })
}