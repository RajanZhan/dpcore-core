const path = require("path");
const fs = require("fs");
import { OriginClass } from "./lib/origin"
import $common from "@dpCore/lib/utils"
const { isString, isObject, isArray, isNumber, isEmptyObject } = $common.getType()



//控制器方法参数 接口
interface actionPathObj {
    path?: string,//路由
    comment?: string,// 接口描述
    desc?: string,// 接口描述
    input?: boolean | {
        body?: object,// body参数格式
        query?: object,// query参数格式
    },
    isolation?: boolean,// 是否是孤立方法，true 则方法该方法时，不经过_init 方法
    output?: object|string
}

/**
* 控制器装饰器  
* @param path 路由
*/
const Router = (path: string) => {

    return function (target: any) {
        target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.baseUrl = path;
    };

}

/**
 * 生成url参数
 * @param path 配置的路由
 * @param methodName  当前的方法名
 * @param methodType  请求的方法类型 如post get put delete 等
 */
const _getPATH = (path: string, methodName: string, methodType: string) => {

    let mname = "";
    if (path) {

        if (path.indexOf("$") != -1) {
            path = path.replace(/\$/g, `${methodType}`);
        }

        if (path.indexOf("~") != -1) {
            path = path.replace(/~/g, `${methodName}`);
            //console.log(mname)
        }

        mname = path;

    }
    else {
        mname = methodName;
    }
    return mname;
}

/**
*  异常处理装饰器，用于统一定位异常信息
*/
const Exception = () => {

    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});
        if (!target.$Meta.Get) {
            target.$Meta.Exception = methodName;
        }

    }

}


/**
* get请求装饰器
*/
const Get = (path?: actionPathObj | string) => {

    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});
        if (!target.$Meta.Get) {
            target.$Meta.Get = new Map();
        }

        if (isObject(path)) {
            path = <actionPathObj>path;
            let mname = _getPATH(path.path, methodName, 'get');
            target.$Meta.Get.set(mname, target[methodName]);
            if (!target.$Meta.GetRestraint) {
                target.$Meta.GetRestraint = new Map();
            }
            target.$Meta.GetRestraint.set(mname, path);

            if (!target.$Meta.GetAction2PathMap) {
                target.$Meta.GetAction2PathMap = new Map();
            }
            target.$Meta.GetAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址
        }
        else {
            path = <string>path;
            let mname = _getPATH(path, methodName, 'get');
            target.$Meta.Get.set(mname, target[methodName]);
            if (!target.$Meta.GetAction2PathMap) {
                target.$Meta.GetAction2PathMap = new Map();
            }
            target.$Meta.GetAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址
        }


    }

}

/**
* post请求装饰器
*/
const Post = (path?: actionPathObj | string, ) => {

    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});
        if (!target.$Meta.Post) {
            target.$Meta.Post = new Map();
        }

        if (isObject(path)) {
            path = <actionPathObj>path;
            let mname = _getPATH(path.path, methodName, 'post');
            target.$Meta.Post.set(mname, target[methodName]);
            if (!target.$Meta.PostRestraint) {
                target.$Meta.PostRestraint = new Map();
            }
            target.$Meta.PostRestraint.set(mname, path);

            if (!target.$Meta.PostAction2PathMap) {
                target.$Meta.PostAction2PathMap = new Map();
            }
            target.$Meta.PostAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址

        }
        else {
            path = <string>path;
            let mname = _getPATH(path, methodName, 'post');
            target.$Meta.Post.set(mname, target[methodName]);
            if (!target.$Meta.PostAction2PathMap) {
                target.$Meta.PostAction2PathMap = new Map();
            }
            target.$Meta.PostAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址
        }

    }

}

/**
* put请求装饰器
*/
const Put = (path?: actionPathObj | string) => {

    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});

        if (isObject(path)) {
            path = <actionPathObj>path;
            let mname = _getPATH(path.path, methodName, 'put');
            target.$Meta.Put.set(mname, target[methodName]);
            if (!target.$Meta.PutRestraint) {
                target.$Meta.PutRestraint = new Map();
            }
            target.$Meta.PutRestraint.set(mname, path);

            if (!target.$Meta.PutAction2PathMap) {
                target.$Meta.PutAction2PathMap = new Map();
            }
            target.$Meta.PutAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址

        }
        else {

            path = <string>path;
            if (!target.$Meta.Put) {
                target.$Meta.Put = new Map();
            }
            let mname = _getPATH(path, methodName, 'put');
            target.$Meta.Put.set(mname, target[methodName]);
            if (!target.$Meta.PutAction2PathMap) {
                target.$Meta.PutAction2PathMap = new Map();
            }
            target.$Meta.PutAction2PathMap.set(methodName, mname);// 缓存控制器名与对应的url地址

        }

    }

}


/**
* delete请求装饰器
*/
const Delete = (path?: actionPathObj | string) => {

    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});


        if (isObject(path)) {
            path = <actionPathObj>path;
            let mname = _getPATH(path.path, methodName, 'delete');
            target.$Meta.Delete.set(mname, target[methodName]);
            if (!target.$Meta.DeleteRestraint) {
                target.$Meta.DeleteRestraint = new Map();
            }
            target.$Meta.DeleteRestraint.set(mname, path);

            if (!target.$Meta.DeleteAction2PathMap) {
                target.$Meta.DeleteAction2PathMap = new Map();
            }
            target.$Meta.DeleteAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址
        }
        else {
            path = <string>path;
            if (!target.$Meta.Delete) {
                target.$Meta.Delete = new Map();
            }
            let mname = _getPATH(path, methodName, 'delete');
            target.$Meta.Delete.set(mname, target[methodName]);
            if (!target.$Meta.DeleteAction2PathMap) {
                target.$Meta.DeleteAction2PathMap = new Map();
            }
            target.$Meta.DeleteAction2PathMap.set(methodName, mname);// 缓存控制器名与对应的url地址

        }

    }

}

/**
* delete请求装饰器
*/
const All = (path?: actionPathObj | string) => {

    return function (target, methodName: string, descriptor: PropertyDescriptor) {
        !target.$Meta && (target.$Meta = {});


        if (isObject(path)) {
            path = <actionPathObj>path;
            let mname = _getPATH(path.path, methodName, 'all');
            target.$Meta.All.set(mname, target[methodName]);
            if (!target.$Meta.AllRestraint) {
                target.$Meta.AllRestraint = new Map();
            }
            target.$Meta.AllRestraint.set(mname, path);

            if (!target.$Meta.AllAction2PathMap) {
                target.$Meta.AllAction2PathMap = new Map();
            }
            target.$Meta.AllAction2PathMap.set(mname, methodName);// 缓存控制器名与对应的url地址

        }
        else {
            path = <string>path;
            if (!target.$Meta.All) {
                target.$Meta.All = new Map();
            }
            let mname = _getPATH(path, methodName, 'all');
            target.$Meta.All.set(mname, target[methodName]);
            if (!target.$Meta.AllAction2PathMap) {
                target.$Meta.AllAction2PathMap = new Map();
            }
            target.$Meta.AllAction2PathMap.set(methodName, mname);// 缓存控制器名与对应的url地址

        }

    }

}

class Controller extends OriginClass {
    public req: request;
    public res: response;

    public response: response;
    public request: request;

    public isPost: boolean;
    public isGet: boolean;
    public isPut: boolean;
    public isDelete: boolean;
    public action: string;// 当前请求的action
    public currentUrl: string;// 当前请求的url地址
    protected $Meta: any;

    protected assignData: {};// 控制器从浏览器输出的数据

    constructor(req: request, res: response) {
        super()
        this.req = req
        this.res = res;
        this.request = req;
        this.response = res;

        this.isGet = false;
        this.isPost = false;
        this.isPut = false;
        this.isDelete = false;

    }

    // 初始化方法
    protected async _init(action: string): Promise<boolean> {
        return true;
    }
    // 读取基础路由
    getRouter() {
        return this.$Meta.baseUrl;
    }

    // 读取某个方法的url
    getActionUrl(action?: string) {
        if (action) {
            return path.join(this.getRouter(), action).replace(/\\/g, '/')
        }
        return path.join(this.getRouter(), this.action).replace(/\\/g, '/')
    }

    // 修改req的中
    setReq(req) {
        this.req = req;
    }

    // 修改res的中
    setRes(res) {
        this.res = res;
    }

    // 设置每次请求的action
    setAction(action) {
        this.action = action;
    }

    setMethod(req?: any) {
        req ? req : this.req
        if (!req || !req.method) {
            throw new Error("控制器请求时，setMethod 初始化失败");
        }
        switch (this.req.method) {
            case "GET":
                this.isGet = true;
                break;
            case "POST":
                this.isPost = true;
                break;
            case "PUT":
                this.isPut = true;
                break;
            case "DELETE":
                this.isDelete = true;
                break;
        }
        //console.log(this.req.method);
    }

    // 设置当前请求的url地址
    setCurrentUrl(url) {
        if (url) {
            this.currentUrl = url;
        }
    }
    // 读取当前请求的url地址
    getCurrentUrl() {
        return this.currentUrl;
    }

    // 加入前端渲染数据
    assign(data) {
        if (data) {
            this.assignData = this.assignData ? this.assignData : {}
            this.assignData = Object.assign(this.assignData, data)
        }
    }
    // 提取渲染的数据
    getAssign() {
        return this.assignData;
    }

    // 模板输出
    display(url: string, data?: any) {
        if (!data || data == undefined) {
            data = {};
        }
        // 系统数据
        data['$sys'] = {
            curl: this.getCurrentUrl()
        }
        //读取基础数据进行输出
        let assign = this.getAssign() ? this.getAssign() : {}
        data = Object.assign(assign, data)
        this.res.display(url, data);
    }

    /**
     * 模板输出方法
     * @param template 模板名字
     * @param data  输出的数据
     */
    show(template: string, data?: any) {
        if (!data || data == undefined) {
            data = {};
        }
        // 系统数据
        data['$sys'] = {
            curl: this.getCurrentUrl()
        }
        //读取基础数据进行输出
        let assign = this.getAssign() ? this.getAssign() : {}
        data = Object.assign(assign, data);
        return {
            _TEMPLATE_:true,
            template:template,
            data:data,
        }
    }


    // 数据输出
    async success(data) {
        try {
            let url = this.getActionUrl();
            let restraint = null;
            if (this.isGet) {
                if (this.$Meta && this.$Meta.GetRestraint) {
                    restraint = this.$Meta.GetRestraint.get(this.action)
                }

            }
            if (this.isPost) {
                if (this.$Meta && this.$Meta.PostRestraint) {
                    restraint = this.$Meta.PostRestraint.get(this.action)
                }
            }
            if (restraint && restraint.output) {
                if (isEmptyObject(restraint.output)) {
                    if (!isEmptyObject(data)) {
                        throw new Error("定了空对象的输出格式，但是输出内容并不是空对象");
                    }
                }
                if (!$common.compareDataType(data, restraint.output)) {
                    throw new Error(`接口：${url}  输出时,期望的数据和真实输出的数据数据类型不相同`)
                }
                if (isArray(data)) {
                    for (let d of data) {
                        await $common.inputChecker(d, restraint.output)
                    }
                }
                else if (isObject(data)) {
                    await $common.inputChecker(data, restraint.output)
                }
                else if (data === false) {
                    return this.res.ok(data);
                }
                else {
                    throw new Error("输出的内容只支持对象或者数组");
                }

            }
            else {
                //如果不设定 输出的格式，但是还有输出，那么将会报错
                if (data) {
                    throw new Error("本接口未定义输出数据格式，无法输出数据");
                }
            }
            this.res.ok(data);
        }
        catch (err) {
            err.message += ",接口数据输出发生异常，接口：" + this.getActionUrl();
            throw err;
        }
    }

    // 数据输出
    async text(data) {
        this.res['out'](data);
    }

    // 重定向
    rego(url: string, code?: any, data?: object) {
        this.res.rego(url, code, data);
    }

    // 重定向
    redirect(url: string, code?: any) {
        this.res.rego(url, code);
    }

    // 错误输出
    error(err) {

        if ($config.debug == 1) {
            console.error("异常,", err)
            this.res.error({ message: err.message, stack: err.stack })
        }
        else {
            this.res.error(err.message)
        }
    }

    // 控制器还原,每个请求的控制还原
    reset() {
        this.isGet = false;
        this.isPost = false;
        this.isPut = false;
        this.isDelete = false;
    }



    // 终止业务
    stop(data) {
        this.res.stop(data);
    }

    /**
     * 处理单文件文件上传
     * @param baseUrl  存放文件的根路径
     * @param desPath  存放的路径
     * @param files  文件字段请求的files
     * @param fileName 文件名 如果有文件 则使用,否则将随意生成
     */
    async singleFileUploader(baseUrl: string, desPath: string, files: any[], fileName?: string) {

        // 读取上传图片的数据写入目标文件夹，同时删除临时中转文件
        var desDir = path.join($rootPath, baseUrl, desPath);// 存放上传文件的文件夹
        var extname = path.extname(files[0].originalname);
        var saveFileName = fileName ? `${fileName}${extname}` : `${$common.getId()}${extname}`;
        var desFilePath = desDir + "/" + saveFileName; // 构建完整的目标路径
        var uploadFilePath = files[0].path;
        if (!desFilePath || !uploadFilePath) {

            throw new Error("上传文件参数构建失败");
        }
        // 判断存放路径
        if (!fs.existsSync(desDir)) {
            let createDirResult = $common.mkdirsSync(desDir);//创建文件夹
            if (!createDirResult) {
                throw new Error("存放文件夹创建失败");
            }
        }
        if (!fs.existsSync(uploadFilePath)) {
            throw new Error("无法读取临时文件夹中的文件");
        }

        // 写入数据文件数据
        fs.writeFileSync(desFilePath, fs.readFileSync(uploadFilePath));
        // 删除临时文件
        fs.unlinkSync(uploadFilePath);
        return desPath + "/" + saveFileName;
    }
}


export { Router, Controller, Get, Post, Put, Delete, All, Exception }