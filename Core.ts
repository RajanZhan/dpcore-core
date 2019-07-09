
/**
 * 应用实例
 */
const version = "1.0.0"
import { Controller } from "@dpCore/Controller"
import { Entity } from "@dpCore/Entity"
const fs = require("fs");
const jsonmini = require("jsonminify");
const express = require('express');
const app = express();
const path = require("path");
import mapCore from "./lib/map.core"


interface runConfig {
    port: number,// 启动的端口
    protocal: {
        type: string,// http 或者 https 
        cert?: string,// ssl 证书公钥路径
        key?: string,// ssl证书私钥路径
    }
}


class Application {

    //protected $Meta = {} // 注解存放的对象

    constructor() {
        //console.log("app contructor")
        global['$common'] = require("./lib/utils").default;

    }

    /**
     * 内部启动方法
     */
    public async  start(): Promise<{ server: any,app:any }> {
        interface AppInstance {
            $Meta: {
                $config: Config,
                $Controllers: Controller | Controller[],
                $Middleware: (app:{use:any}) => {},
                $Validate:object,
            }
        }
        var instance: AppInstance = <any>this;
        const $config = instance.$Meta.$config;
        const $Middleware = instance.$Meta.$Middleware;
        const $Controllers = instance.$Meta.$Controllers;
        const $Validate = instance.$Meta.$Validate;
        // console.log($config, "应用启动")
        // return;
        const colors =require("colors");
        const template = require('art-template');
        const cookieParser = require('cookie-parser');
        const bodyParser = require('body-parser');
    
        //const middleware = require("./common/middleWare");
        const logger = require("./lib/logger.js").default;
        const http = require("http");
        const https = require('https')

        // 设置模板引擎 start
        template.config('base', '');
        template.config('extname', '.html');
        app.engine('.html', template.__express);
        app.set('view engine', 'html');
        // 设置模板引擎 end

        // 注册全局对象，方法
        global['regGlobal'] = (name, obj) => {
            global[name] = obj
        }
        global['$logger'] = logger;
        global['$config'] = $config;
        global['$Validate'] = $Validate;
        const $dataChecker = require("./lib/validate.core.v1").default
        global['$dataChecker'] = $dataChecker;
        
        if ($config.cross == 1) {
            app.use((req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Token,Appid,AppId");
                res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
                next();
                //console.log("跨域处理hahah");
            });
        }
        app.use((req,res,next)=>{
            res.header("X-Powered-By",'dpCore v'+version)
            next();
        })
        app.use(bodyParser.json({
            limit: '50mb'
        }));
        app.use(bodyParser.urlencoded({
            limit: '50mb',
            extended: false,
            parameterLimit: 50000
        }));
        const cookieKey = 'keyboard 11cat';
        app.use(cookieParser(cookieKey));
        // app.use(require("./lib/session"));
        if ($config.session) {
            //启动session
            app.use(require("./lib/session"));
            //console.log("启用session");
        }
        // 挂载response扩展方法
        const responseExtends = require("./lib/response");
        app.use((req, res, next) => {
            for (let key in responseExtends) {
                res[key] = responseExtends[key];
            }
            next();
        });
        template.config('base', '');
        template.config('extname', '.html');
        app.engine('html', template.__express);
        app.set('view engine', 'html');
        if ($config.debug == 1) {
            app.set('views', path.join(__dirname, '../../', $config.viewPath?$config.viewPath:"views"));
            //console.log("set views ",path.join(__dirname,'../src/', $config.viewPath));
        } else {
            app.set('views', path.join(__dirname, $config.viewPath?$config.viewPath:"views"));
        }
        //挂载静态目录
        if ($config.debug == 1) {

            if ($config.staticPath && $config.staticPath.length > 0) {
                for (let p of $config.staticPath) {
                    if(!p)
                    {
                        continue;
                    }
                    //let devpath = path.join(__dirname,"../../src/"+$config.name,p)
                    let devpath = path.join(__dirname, "../../", p)
                    //console.log("静态目录 debug ",devpath);
                    app.use("/static", express.static(devpath));
                    app.use(express.static(devpath));
                }
            }
        } else {
            if ($config.staticPath.length > 0) {
                for (let p of $config.staticPath) {
                    if(!p){
                        continue;
                    }
                    app.use("/static", express.static(p));
                    app.use(express.static(p));
                }
            }
        }

        // 载入中间件
        if($Middleware)
        {
            //app.use($Middleware)
            $Middleware(app)
        }
        // var sysMiddleware = require("./lib/middleware").default;
        // app.use(sysMiddleware);
        // middleware(app); // 调用自定义中间件
        // // 挂载路由
        // //router(app);
        // //require("./lib/controller.core")(app, require("./common/router"));
        // require("./lib/map.core").default(app);

        // 注册控制器
        mapCore(app,$Controllers,$config);


        // let build = require("./build.js").default;
        // regGlobal("$build", build);
        // //console.log(build);

        // // 注册逻辑层
        // require("./lib/LogicRegister").default();

        // // 注册model
        // require("./lib/ModelRegister").default();

        // // 注册微服务
        // if ($config && $config.msServer && $config.msServer.isUse) {
        //     require("./lib/microServer").default();
        // }
        // //console.log("我服务",$config);

        // // 初始化微服务客户端
        // if ($config && $config.msClient && $config.msClient.isUse) {
        //     global.$msClient = require("./lib/microClient").default;
        //     console.log("初始化微服务客户端...");
        // } else {
        //     global.$msClient = () => {
        //         throw new Error("无法调用rpc，请先启用rpc client，并且完成正确的配置");
        //     }
        // }

        //console.log("model test ",$model("System.test",{}));
        let port = $config.port ? $config.port : 8001;
        let host = $config.host ? $config.host : "0.0.0.0";
        var server = null;
        var isHttps = false;
        if ($config['https'] && $config['https']['use'] == 1 && $config['https']['key'] && $config['https']['cert']) {
            let httpConfig = <any>{}
            httpConfig.key = $common.getAbsolutePath($config['https']['key']);
            httpConfig.cert = $common.getAbsolutePath($config['https']['cert']);
            if (!fs.existsSync(httpConfig.key) || !fs.existsSync(httpConfig.cert)) {
                console.log(<any>"证书文件地址", $common.getAbsolutePath($config['https']['cert']));
                throw new Error("ssl 证书不存，无法创建https 服务");
            }
            httpConfig.key = fs.readFileSync(httpConfig.key);
            httpConfig.cert = fs.readFileSync(httpConfig.cert);
            server = https.createServer(httpConfig, app).listen(port, host);
            isHttps = true;
        }
        else {
            server = http.createServer(app).listen(port, host);
        }

        // // var io = require('socket.io')(server);
        // await require("./common/start").default(app, server);

        // await require("./lib/RegisterApp").default(); // 注册应用
        // //app.listen($config.port, $config.host);
        // //console.log("路由权限注册 ",$appRight);

        let msg = <any> "";
        if (isHttps) {
            msg = ` 启动信息： 协议:[https]  绑定的IP[${host}]  监听端口 [${port}] 启动模式[${$config.debug == 1 ? 'Debug' : 'Release'}] `
        }
        else {
            msg = `启动信息： 协议:[http]  绑定的IP[${host}]  监听端口 [${port}] 启动模式[${$config.debug == 1 ? 'Debug' : 'Release'}] `
        }
        console.log( msg.cyan);

        app.use((req, res, next) => {
            if ($config.notFound) {
                let oriURL = req.path;
                return res.rego($config.notFound, 302, {
                    oriPath: oriURL,
                    methods: req.method
                });
            }
            res.send("404");
        });
        return {
            server,
            app,
        };
    }

}

const Boot = (app: any) => {
    const instance = <Application>new app();
    instance.start();
}


/**
 * 控制器注入
 */
const ControllerInject = (ctrl: any[]) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$Controllers = ctrl;
    }
}

/**
 * model 注册器
 */
const ModelInject = () => { }


/**
 * 中间件 注入(req:any,res:any,next:any)=>{}
 */
const MiddlewareInject = (func:any) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$Middleware = func;
    }
 }

/**
 * 实体模型注入
 */
const EntityInject = (Entitys:Entity[]) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$Entitys = Entitys;
    }
}

// interface Config {
//     [key: string]: boolean | number | string | any;
//     debug?: number,// 1 说明是debug 模式，0 说明是部署模式
//     port?: number,//监听的端口
// }
/**
 * 配置文件注入
 */
const ConfigInject = (config: Config) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$config = config;
    }
}

/**
 * 检验类注入
 */
const ValidateInject = () => { }


/**
 * 全局函数注入
 */
const FunctionInject = () => { }

/**
 * 模块注入
 */
const ModuleInject = () => { }

export {
    Application,
    ControllerInject,
    ModelInject,
    MiddlewareInject,
    EntityInject,
    ConfigInject,
    ValidateInject,
    FunctionInject,
    ModuleInject,
    Boot
}

