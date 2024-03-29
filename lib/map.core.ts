
// 注册控制器
// import controller from "../common/map"

import $logger from "@dpCore/lib/logger"
import utils from "@dpCore/lib/utils"
const { isArray, isString, isObject, isEmptyObject } = utils.getType()
const inputChecker1 = utils.inputChecker1;// 数据合法性校验方法

export default (app, controller, $config, application) => {
    if (!controller) {
        console.log("未注册任何控制器...");
        return;
    }
    // 统一输出处理
    const dealOutput = async (result, res, cntl) => {
        try {
            var url = cntl.getActionUrl();
            if (!result || result == undefined || result == "undefined") {
                throw new Error(`接口 ${url} 接口异常，无法输出undefined数据`);
            }

            if (result._TEMPLATE_) // 说明模板输出
            {
                if (!result.template || !result.data) {
                    throw new Error("模板输出时报错，可能是因为template 或 data 参数为空");
                }
                res.render(result.template, result.data)
            }
            else if (result._DOWNLOAD_) {
                res.download(result.filepath, result.filename);
            }
            else if (result._REDIRECT_) {
                return res.rego(result.url, result.code, result.data);
            }

            else // 普通的输出
            {

                let beforeResponse = async (result) => {
                    if (application.$Meta && application.$Meta.$BeforeResponse) {
                        result = await application.$Meta.$BeforeResponse(result);
                    }
                    return result;
                }

                // 这里需要做数据输入的校验

                if (result === false) {
                    return res.send(result)
                }

                let restraint = null;
                if (cntl.isGet) {
                    if (cntl.$Meta && cntl.$Meta.GetRestraint) {
                        restraint = cntl.$Meta.GetRestraint.get(cntl.action)
                    }

                }
                if (cntl.isPost) {
                    if (cntl.$Meta && cntl.$Meta.PostRestraint) {
                        restraint = cntl.$Meta.PostRestraint.get(cntl.action)
                    }
                }
                if (cntl.isPut) {
                    if (cntl.$Meta && cntl.$Meta.PutRestraint) {
                        restraint = cntl.$Meta.PutRestraint.get(cntl.action)
                    }
                }

                if (cntl.isDelete) {
                    if (cntl.$Meta && cntl.$Meta.DeleteRestraint) {
                        restraint = cntl.$Meta.DeleteRestraint.get(cntl.action)
                    }
                }

                if (restraint && restraint.output) {
                    if (isEmptyObject(restraint.output)) {
                        if (!isEmptyObject(result)) {
                            throw new Error("定了空对象的输出格式，但是输出内容并不是空对象");
                        }
                    }
                    if (!$common.compareDataType(result, restraint.output)) {
                        throw new Error(`接口：${url}  输出时,期望的数据和真实输出的数据数据类型不相同`)
                    }
                    if (isArray(result)) {
                        // for (let d of result) {
                        //     await inputChecker1(d, restraint.output)
                        // }
                        throw new Error(`接口：${url}  输出时结果为数组，为了接口安全，暂不支持接口直接输出数组，请将数组结果挂载在对象属性上`)
                        //await inputChecker1(result, restraint.output)
                    }
                    else if (isString(result)) {
                        if (!isString(restraint.output)) {
                            throw new Error(`接口：${url}  输出时,输出内容为字符串，但是output规则却不是字符串`)
                        }
                        // 校验数据合法性
                        await inputChecker1({ result: result }, { result: restraint.output });
                        //return res.send(result)
                    }
                    else if (isObject(result)) {
                        await inputChecker1(result, restraint.output)
                    }
                    else if (result === false) {
                        result = await beforeResponse(result);
                        return res.send(result);
                    }
                    else {
                        throw new Error("输出的内容只支持对象或者数组");
                    }

                }
                else {
                    //如果不设定 输出的格式，但是还有输出，那么将会报错
                    // if (result) {
                    //     throw new Error("本接口未定义输出数据格式，无法输出数据");
                    // }
                }

                result = await beforeResponse(result);
                res.send(result)
            }

        }
        catch (err) {
            err.message += ",接口数据输出发生异常，接口：" + cntl.getActionUrl();
            throw err;
            // res.status(500)
            // console.error(err)
            // res.send(err.message)
        }
    }
    var inputChecker = $common.inputChecker1;
    const { isEmptyObject } = $common.getType();
    const validateInput = async (contrl, restraint, req) => {
        if (restraint) {
            if (restraint.input) {
                if (!restraint.input.query && !restraint.input.body) {
                    throw new Error("接口注解中，输入参数校验对象input只支持query 和 body 属性");
                }
                if (restraint.input.query) {
                    req.query = await inputChecker1(req.query, restraint.input.query)
                }
                else {
                    req.query = {}
                }
                if (restraint.input.body) {
                    req.body = await inputChecker1(req.body, restraint.input.body)
                }
                else {
                    req.body = {}
                }
                //contrl.setReq(req)
            }
            else if (restraint.input === false) {
                if (!isEmptyObject(req.query) || !isEmptyObject(req.body)) {
                    throw new Error("本接口不接收任何参数");
                }
                req.body = {}
                req.query = {}
            }
        }
        return contrl
    }
    var ControllerInstance = new Map(); // 存储控制器实例对象

    function getControllerInstance(key) {
        let cls = controller[key];
        if (!cls) {
            throw new Error(`控制器类不存在 ${key}`)
        }
        let instance = <any>new cls;
        instance.App = application;
        return instance;
        //return ControllerInstance.get(key);
    }
    //console.log("控制器注册",controller);
    let routesPath = new Set();// 缓存 类控制器基础路由
    let getFullUrl = new Set();
    let postFullUrl = new Set();
    let putFullUrl = new Set();
    let deleteFullUrl = new Set();
    let allFullUrl = new Set();
    var ControllerUrlMap = new Map();// 将控制器名，方法名，类型名 对应到 url 来 

    var controllerApis = null;
    // 生成接口描述信息
    if ($config.debug == 1) {
        controllerApis = new Map();
    }
    for (let map in controller) {
        let cntl = <any>new controller[map]

        //console.log(controller[map].name);
        ControllerInstance.set(map, cntl);

        if (!cntl || !cntl.$Meta || !cntl.$Meta.baseUrl) {
            throw new Error(`控制器 ${controller[map].name} 不是一个合法的控制的 `);
        }
        if (routesPath.has(cntl.$Meta.baseUrl)) {
            console.log(map, controller)
            throw new Error(`存在重名的路由注册！ o(╥﹏╥)o  .....,${cntl.$Meta.baseUrl}`);
        }
        let baseUrl = cntl.$Meta.baseUrl;// 类控制器基础路由
        let Get = cntl.$Meta.Get;
        let Post = cntl.$Meta.Post;
        let Put = cntl.$Meta.Put;
        let Delete = cntl.$Meta.Delete;
        let All = cntl.$Meta.All;
        var dealUrlPostfix = (url, tmpi) => {
            if ($config.urlPostfix && tmpi && (tmpi.indexOf('.') == -1)) {
                url = `${baseUrl}/${tmpi}${$config.urlPostfix}`;
            }
            else {
                url = `${baseUrl}/${tmpi}`;
            }
            url = url.replace(/\/\/\//g, '/');
            url = url.replace(/\/\//g, '/');
            return url;
        }

        //console.log("注册控制器", Get.size, cntl.$Meta);
        if (Get && Get.size > 0) {
            for (let i of Get.keys()) {
                var url = "";
                let tmpi = ""
                tmpi = i
                // url 后缀
                url = dealUrlPostfix(url, tmpi);
                if (getFullUrl.has(url)) {
                    throw new Error(`存在重名的Get API 地址！ o(╥﹏╥)o  .....,${url}`)
                }
                getFullUrl.add(url)
                if (!url) {
                    throw new Error("url 为空，无法注册路由 in map.core");
                }
                //app.get()
                //console.log(i);
                let actionName = cntl.$Meta.GetAction2PathMap.get(i);
                ControllerUrlMap.set(`${map}.${actionName}.get`, url)
                app.get(url, async (req, res) => {
                    let contrl = getControllerInstance(map)
                    contrl.setRes(res)
                    contrl.reset()
                    //console.log(cntl.$Meta)
                    contrl.setReq(req);
                    contrl.setMethod(req);
                    contrl.setAction(tmpi);
                    try {
                        // 校验输入的参数
                        let restraint = null;
                        if (contrl.$Meta && contrl.$Meta.GetRestraint) {
                            restraint = contrl.$Meta.GetRestraint.get(i);
                            contrl = await validateInput(contrl, restraint, req)
                        }

                        if (contrl['_init'] && (!restraint || !restraint.isolation)) {
                            let initResult = await contrl['_init'](i);
                            if (initResult === false) {
                                return res.send(`请求接口${url}被中断`)
                            }
                            if (isArray(initResult)) {
                                if (initResult[0] === false) {
                                    if (initResult[1]) {
                                        return res.send(`请求接口${url}被中断,中断原因:${initResult[1]}`)
                                    }
                                    else {
                                        return res.send(`请求接口${url}被中断`)
                                    }
                                }
                            }
                        }
                        let func = contrl[i];
                        if (!func) {
                            func = contrl.$Meta.Get.get(i)
                        }
                        if (!func) {
                            throw new Error(`路由请求发生错误，${map} 控制器的 ${i}方法读取失败`);
                        }
                        let curl = ControllerUrlMap.get(`${map}.${actionName}.get`)
                        contrl.setCurrentUrl(curl);
                        // 处理接口输出
                        let result = await func.call(contrl);
                        await dealOutput(result, res, contrl);
                    }
                    catch (err) {
                        try {
                            if (contrl.$Meta && contrl.$Meta.Exception) {
                                let func = contrl[contrl.$Meta.Exception];
                                if (func) {
                                    return res.send(await func.call(contrl, err));
                                }
                            }
                            res.send(`接口请求异常 ${url},${err.message}`);
                        }
                        catch (err_in_cache) {
                            let err = {
                                position: "map.core.ts",
                                error: err_in_cache,
                                remark: "在catch中发生异常"
                            }
                            $logger.error(err);
                            console.error(err);
                        }

                    }

                })

                if (controllerApis) {
                    if (cntl.$Meta.GetRestraint && cntl.$Meta.GetRestraint.size > 0) {
                        let obj = cntl.$Meta.GetRestraint.get(i)
                        if (obj) {
                            controllerApis.set(url, {
                                methods: "GET",
                                input: obj.input,
                                desc: obj.desc ? obj.desc : obj.comment,
                                output: obj.output
                            })
                        }

                    }
                }

            }

        }
        if (Post && Post.size > 0) {
            for (let i of Post.keys()) {
                var url = "";
                let tmpi = ""
                tmpi = i
                url = dealUrlPostfix(url, tmpi);
                if (postFullUrl.has(url)) {
                    throw new Error(`存在重名的POST API 地址！ o(╥﹏╥)o  .....,${url}`)
                }
                postFullUrl.add(url)
                if (!url) {
                    throw new Error("url 为空，无法注册路由 in map.core");
                }
                //app.get()
                //console.log(i);
                let actionName = cntl.$Meta.PostAction2PathMap.get(i);
                ControllerUrlMap.set(`${map}.${actionName}.post`, url)
                app.post(url, async (req, res) => {
                    // let contrl = new controller[map](req, res);
                    let contrl = getControllerInstance(map)
                    contrl.reset()
                    contrl.setRes(res)
                    contrl.setReq(req);
                    contrl.setMethod(req);
                    contrl.setAction(tmpi)
                    try {

                        // 校验输入的参数
                        let restraint = null;
                        if (contrl.$Meta && contrl.$Meta.PostRestraint) {
                            restraint = contrl.$Meta.PostRestraint.get(i);
                            contrl = await validateInput(contrl, restraint, req)
                        }

                        if (contrl['_init'] && (!restraint || !restraint.isolation)) {
                            let initResult = await contrl['_init'](i);
                            if (!initResult) {
                                return;
                            }
                        }
                        let func = contrl[i];
                        if (!func) {
                            func = contrl.$Meta.Post.get(i)
                        }
                        if (!func) {
                            throw new Error(`路由请求发生错误，${map} 控制器的 ${i}方法读取失败`);
                        }

                        let curl = ControllerUrlMap.get(`${map}.${actionName}.post`)
                        contrl.setCurrentUrl(curl);
                        await dealOutput(await func.call(contrl), res, contrl);

                    }
                    catch (err) {
                        try {
                            if (contrl.$Meta && contrl.$Meta.Exception) {
                                let func = contrl[contrl.$Meta.Exception];
                                if (func) {
                                    return res.send(await func.call(contrl, err));
                                }
                            }
                            res.send(`接口请求异常 ${url},${err.message}`);
                        }
                        catch (err_in_cache) {
                            let err = {
                                position: "map.core.ts",
                                error: err_in_cache,
                                remark: "在catch中发生异常"
                            }
                            $logger.error(err);
                            console.error(err);
                        }
                    }
                })

                if (controllerApis) {
                    if (cntl.$Meta.PostRestraint && cntl.$Meta.PostRestraint.size > 0) {
                        let obj = cntl.$Meta.PostRestraint.get(i)
                        if (obj) {
                            controllerApis.set(url, {
                                methods: "POST",
                                input: obj.input,
                                desc: obj.desc ? obj.desc : obj.comment,
                                output: obj.output
                            })
                        }
                    }
                }
            }

        }
        if (Put && Put.size > 0) {
            for (let i of Put.keys()) {
                var url = "";
                let tmpi = ""
                // if (i.indexOf('/') == 0) {
                //     tmpi = i.replace('/', '')
                // }
                // else {
                //     tmpi = i
                // }
                tmpi = i
                url = dealUrlPostfix(url, tmpi);
                if (putFullUrl.has(url)) {
                    throw new Error(`存在重名的 PUT API 地址！ o(╥﹏╥)o  .....,${url}`)
                }
                putFullUrl.add(url)
                if (!url) {
                    throw new Error("url 为空，无法注册路由 in map.core");
                }
                //app.get()
                //console.log(i);
                let actionName = cntl.$Meta.PutAction2PathMap.get(i);
                ControllerUrlMap.set(`${map}.${actionName}.put`, url)
                app.put(url, async (req, res) => {
                    // let contrl = new controller[map](req, res);
                    let contrl = getControllerInstance(map)
                    contrl.setRes(res)
                    contrl.reset()
                    contrl.setReq(req);
                    contrl.setMethod(req);
                    contrl.setAction(tmpi)
                    try {

                        // 校验输入的参数
                        let restraint = null;
                        if (contrl.$Meta && contrl.$Meta.PutRestraint) {
                            restraint = contrl.$Meta.PutRestraint.get(i);
                            contrl = await validateInput(contrl, restraint, req)
                        }


                        if (contrl['_init'] && (!restraint || !restraint.isolation)) {
                            let initResult = await contrl['_init'](i);
                            if (!initResult) {
                                return;
                            }
                        }
                        let func = contrl[i];
                        if (!func) {
                            func = contrl.$Meta.Put.get(i)
                        }
                        if (!func) {
                            throw new Error(`路由请求发生错误，${map} 控制器的 ${i}方法读取失败`);
                        }
                        let curl = ControllerUrlMap.get(`${map}.${actionName}.put`)
                        contrl.setCurrentUrl(curl);
                        await dealOutput(await func.call(contrl), res, contrl);

                    }
                    catch (err) {
                        try {
                            if (contrl.$Meta && contrl.$Meta.Exception) {
                                let func = contrl[contrl.$Meta.Exception];
                                if (func) {
                                    return res.send(await func.call(contrl, err));
                                }
                            }
                            res.send(`接口请求异常 ${url},${err.message}`);
                        }
                        catch (err_in_cache) {
                            let err = {
                                position: "map.core.ts",
                                error: err_in_cache,
                                remark: "在catch中发生异常"
                            }
                            $logger.error(err);
                            console.error(err);
                        }
                    }
                })

                if (controllerApis) {
                    if (cntl.$Meta.PutRestraint && cntl.$Meta.PutRestraint.size > 0) {
                        let obj = cntl.$Meta.PutRestraint.get(i)
                        if (obj) {
                            controllerApis.set(url, {
                                methods: "POST",
                                input: obj.input,
                                desc: obj.desc ? obj.desc : obj.comment,
                                output: obj.output
                            })
                        }
                    }
                }
            }

        }
        if (Delete && Delete.size > 0) {
            for (let i of Delete.keys()) {
                var url = "";
                let tmpi = ""
                tmpi = i
                url = dealUrlPostfix(url, tmpi);
                if (deleteFullUrl.has(url)) {
                    throw new Error(`存在重名的 DELETE API 地址！ o(╥﹏╥)o  .....,${url}`)
                }
                deleteFullUrl.add(url)

                if (!url) {
                    throw new Error("url 为空，无法注册路由 in map.core");
                }
                //app.get()
                //console.log(i);
                let actionName = cntl.$Meta.DeleteAction2PathMap.get(i);
                ControllerUrlMap.set(`${map}.${actionName}.delete`, url)
                app.delete(url, async (req, res) => {
                    // let contrl = new controller[map](req, res);
                    let contrl = getControllerInstance(map)
                    contrl.setRes(res)
                    contrl.reset()
                    contrl.setReq(req);
                    contrl.setMethod(req);
                    contrl.setAction(tmpi)
                    try {
                        // 校验输入的参数
                        // let restraint = contrl.$Meta.DeleteRestraint.get(i);
                        // contrl = await validateInput(contrl, restraint, req)
                        let restraint = null;
                        if (contrl.$Meta && contrl.$Meta.DeleteRestraint) {
                            restraint = contrl.$Meta.DeleteRestraint.get(i);
                            contrl = await validateInput(contrl, restraint, req)
                        }

                        if (contrl['_init'] && (!restraint || !restraint.isolation)) {
                            let initResult = await contrl['_init'](i);
                            if (!initResult) {
                                return;
                            }
                        }
                        let func = contrl[i];
                        if (!func) {
                            func = contrl.$Meta.Delete.get(i)
                        }
                        if (!func) {
                            throw new Error(`路由请求发生错误，${map} 控制器的 ${i}方法读取失败`);
                        }
                        let curl = ControllerUrlMap.get(`${map}.${actionName}.delete`)
                        contrl.setCurrentUrl(curl);
                        await dealOutput(await func.call(contrl), res, contrl);

                    }
                    catch (err) {
                        try {
                            if (contrl.$Meta && contrl.$Meta.Exception) {
                                let func = contrl[contrl.$Meta.Exception];
                                if (func) {
                                    return res.send(await func.call(contrl, err));
                                }
                            }
                            res.send(`接口请求异常 ${url},${err.message}`);
                        }
                        catch (err_in_cache) {
                            let err = {
                                position: "map.core.ts",
                                error: err_in_cache,
                                remark: "在catch中发生异常"
                            }
                            $logger.error(err);
                            console.error(err);
                        }
                    }

                })
                if (controllerApis) {
                    if (cntl.$Meta.DeleteRestraint && cntl.$Meta.DeleteRestraint.size > 0) {

                        let obj = cntl.$Meta.DeleteRestraint.get(i)
                        if (obj) {
                            controllerApis.set(url, {
                                methods: "POST",
                                input: obj.input,
                                desc: obj.desc ? obj.desc : obj.comment,
                                output: obj.output
                            })
                        }

                    }
                }
            }

        }
        if (All && All.size > 0) {
            for (let i of All.keys()) {
                var url = "";
                let tmpi = ""
                tmpi = i
                url = dealUrlPostfix(url, tmpi);
                if (allFullUrl.has(url)) {
                    throw new Error(`存在重名的 DELETE API 地址！ o(╥﹏╥)o  .....,${url}`)
                }
                allFullUrl.add(url)

                if (!url) {
                    throw new Error("url 为空，无法注册路由 in map.core");
                }
                //app.get()
                //console.log(i);
                let actionName = cntl.$Meta.AllAction2PathMap.get(i);
                ControllerUrlMap.set(`${map}.${actionName}.all`, url)
                app.all(url, async (req, res) => {
                    // let contrl = new controller[map](req, res);
                    let contrl = getControllerInstance(map)
                    contrl.setRes(res)
                    contrl.reset()
                    contrl.setReq(req);
                    contrl.setMethod(req);
                    contrl.setAction(tmpi)
                    try {
                        // 校验输入的参数
                        let restraint = null
                        if (contrl.$Meta && contrl.$Meta.AllRestraint) {
                            restraint = contrl.$Meta.AllRestraint.get(i);
                            contrl = await validateInput(contrl, restraint, req)
                        }

                        if (contrl['_init'] && (!restraint || !restraint.isolation)) {
                            let initResult = await contrl['_init'](i);
                            if (!initResult) {
                                return;
                            }
                        }
                        let func = contrl[i];
                        if (!func) {
                            func = contrl.$Meta.All.get(i)
                        }
                        if (!func) {
                            throw new Error(`路由请求发生错误，${map} 控制器的 ${i}方法读取失败`);
                        }
                        let curl = ControllerUrlMap.get(`${map}.${actionName}.all`)
                        contrl.setCurrentUrl(curl);
                        await dealOutput(await func.call(contrl), res, contrl);
                    }
                    catch (err) {

                        try {
                            if (contrl.$Meta && contrl.$Meta.Exception) {
                                let func = contrl[contrl.$Meta.Exception];
                                if (func) {
                                    return res.send(await func.call(contrl, err));
                                }
                            }
                            res.send(`接口请求异常 ${url},${err.message}`);
                        }
                        catch (err_in_cache) {
                            let err = {
                                position: "map.core.ts",
                                error: err_in_cache,
                                remark: "在catch中发生异常"
                            }
                            $logger.error(err);
                            console.error(err);
                        }

                    }

                })
                if (controllerApis) {
                    if (cntl.$Meta.AllRestraint && cntl.$Meta.AllRestraint.size > 0) {
                        let obj = cntl.$Meta.AllRestraint.get(i)
                        if (obj) {
                            controllerApis.set(url, {
                                methods: "POST",
                                input: obj.input,
                                desc: obj.desc ? obj.desc : obj.comment,
                                output: obj.output
                            })
                        }
                    }
                }
            }

        }
    }
    regGlobal("$ControllerUrlMap", ControllerUrlMap)
    regGlobal("$controllerApis", controllerApis)
}