//declare var global :any ;// 全局对象
declare const $rootPath: string;// 系统的根路径

declare var $controllerApis: any// 系统接口描述信息

declare var $ControllerUrlMap: any //  控制器.方法名.类型 ===》 url
// common 对象
declare var $common: {
    [key: string]: boolean | number | string | any;

    /**
     * 读取数据的类型
     *  */
    getType: () => {
        isArray: (input: any) => {},
        isNumber: (input: any) => {},
        isObject: (input: any) => {},
        isBoolean: (input: any) => {},
        isString: (input: any) => {},
        isUndefined: (input: any) => {},
        isNull: (input: any) => {},
        isFunction: (input: any) => {},
        isRegExp: (input: any) => {},
        isEmptyObject: (input: any) => {},
        isDate: (input: any) => {}
    },

    /**
     * 递归创建路径
     * @param path string  创建的路径
     */
    mkdirsSync: (path: string) => {},


    /**
     * 对输入的数据进行校验
     *  @param input 输出的数据 
     *  @param rules 校验的规则
     */
    inputChecker: (input: any, rules: any) => {},


    /**
     * 对json 数组的某一个字段排序
     * @param   array  要排序的json数组对象
     * @param   field  排序字段（此参数必须为字符串）
     * @param   reverse 是否倒序（默认为false）
     * @return  array  返回排序后的json数组
     */
    jsonSort: (array: any[], field: string, reverse: boolean) => { },

    /**
     * 生成32位随机字符串 
     */
    getId:()=>{}

    /**
     * 根据系统的相对路径读取到系统的绝对路径
     */
    getAbsolutePath:(path:string)=>{},


    /**
     * 比较两个 变量的数据类型 是否相等
     * @return  boolean  返回true 或 false
     *  
     */
    compareDataType:(a:any,b:any)=>{}

    /**
     * 生成md5 加密字符串 
     */
    md5:(value:string)=>{}

     /**
     * 数组分页
     * @params {array} arr 目标数据
     * @params {number} page 读取的页数
     * @params {number} size 每页的数据
     */
    arrayPage:(arr:any[], page:number, size:number)=>{},

    /**
     * 生成指定位数的 随机数字
     * @param size 位数
     * @returns {number}. 
     */
    getRandomNum:(size:number)=>{}

}

// req 全局对象
declare var $req: {
    session: (key: string) => {},
    dsession: (key: string) => {},
    $dopAuth: {
        userInfo: {
            uid: number,
            allRight: []
        },

    },

    $ip: string,
}


// interface loggeObj {
//     error:object,// 异常对象
//     position:string,//位置信息
//     remark:string,//备注信息
// }
declare var $logger: {
    error: (err: any) => {},
    info: (info: object) => {},
    debug: (err: object) => {},
    warn: (err: object) => {},
}

// 配置文件
declare var $cache: {
    get: (key: string) => {},

    /**
     *  @param time 缓存的时间，单位秒
     */
    set: (key: string, value: any, time?: number) => {},

    delete: (key: string) => {},
    expire: (key: string, time: number) => {},
}

declare var $commonCache: {
    get: (key: string) => {},
    set: (key: string, value: any, time?: number) => {},
    delete: (key: string) => {},
    expire: (key: string, time: number) => {},
}

// 调用logic 的方法  
declare var $logic: (name: string, params?: any) => {
}
declare var $dataChecker: (task: Array<any>, data: object) => {
}

// 模板编译变量
declare var $tp: any



declare var $config: {
    [key: string]: boolean | number | string | any;
    debug: number,
    name: string,
    type: string,
    noAuthPath: [],
    authPath: [],
    urlPostfix: string,//url后缀
    cacheDefaultExpire: number,//默认缓存时间
    pagination: {
        page: number,
        psize: number,
    },
    msServer: {
        isUse: boolean,
        zkHost: string,
        msPort: number,
        servers: {},// 需要注册的服务
    },
    msClient: {
        zkHost: string,
        isUse: boolean,
    },
    cookie: {
        expire: string,
    },
    db: {
        db: string,
        host: string,
        uname: string,
        pwd: string,
        updateField: boolean,
        port: number,
        logging: boolean,//
    },
    redis: {
        use: string,
        host: string,
        port: number,
        pass: string
    }

    viewPath: string,// 模板引擎的路径

    dopApiExpire: number,// 系统的默认过期时间
    registerAppSecret: string,
    debugAuth: {},
    host: string,
    port: string,
    appRegister: {
        use: number,
        "serverName": string,// 注册地址
        "secret": string,// 注册token
        "appName": string,// 应用名称
        "icon": string// 应用图标  
        url: string,
        desc: string,
    },
    // 短信验证的配置
    smsConfig: {
        smsUrl: string,
        sid: string,
        token: string,
        appId: string,
    },

    // vip token 相关配置
    vipToken: {
        expire: number
    },
}


interface Config {
    [key: string]: boolean | number | string | any;
    debug?: number,
    name?: string,
    type?: string,
    urlPostfix?: string,//url后缀
    cacheDefaultExpire?: number,//默认缓存时间
    pagination?: {
        page: number,
        psize: number,
    },
    msServer?: {
        isUse: boolean,
        zkHost: string,
        msPort: number,
        servers: {},// 需要注册的服务
    },
    msClient?: {
        zkHost: string,
        isUse: boolean,
    },
    cookie?: {
        expire: string,
    },
    db?: {
        db: string,
        host: string,
        uname: string,
        pwd: string,
        updateField: boolean,
        port: number,
        logging: boolean,//
    },
    redis?: {
        use: string,
        host: string,
        port: number,
        pass: string
    }
    viewPath?: string,// 模板引擎的路径
    staticPath?:string[],// 静态文件的路径 
    https?:{
        use:number,// 是否启用https 1 为启用， 0 为禁用
        key:string,// key 文件地址
        cert:string,// cert 文件地址
    },//https 配置
    host?: string,// 绑定的地址
    port?: number,// 监听的端口
    notFound?:string,// 404 控制器 ，例如 @Index.index.get
}

declare var $Validate:any;// 全局数据校验对象

declare var $appRights: {
    keys: () => {

    },
    get: (r: any) => {}

}// 应用权限

// 微服务客户端
interface msClient {
    interfaceName: string,
    actionName: string,
    params?: any
}
//import {msClient} from "../lib/microClient"
declare var $msClient: (obj: msClient) => {}


declare var regGlobal: (name: string, params: any) => {}// 全局变量注册
declare var getGlobal: (name: string) => {} // 读取全局变量

// 所有逻辑类的缓存
declare var $logicClass: any
declare var $lg: (name: string, params?: any) => {}

//新逻辑调用方法
declare var $lgc: (name: string, req: any, params?: any) => {}

declare var $model: any;

declare var $mdl: (name: string, logic: any, params?: any) => {}

declare var $build: {
    logic: any,
    model: any,
}


// 全局主账号 信息
declare var $mainUserInfo: {
    uid: number,
    allRight: [],// 所有权限
}

// 数据模型字段映射全局变量 虚拟映射真实 
declare var $modelFieldMap: {
    get: (key: any) => {}
}

// 数据模型字段映射全局变量 真实映射虚拟
declare var $realFieldToVfieldMap: {
    get: (key: any) => {}
}

// 模型主键缓存
declare var $modelPrimaryKeyMap: {
    get: (key: any) => {}
}

// 数据库对象
declare var $db: {
    models: [],
    transaction: (t?: any) => {

    }
}


/***
 * 系统接口，http 请求对象
 */
declare interface request {

    query: any,
    body: any,
    rawBody: any,
    method: string, // 本次请求的类，例如get post put
    originalUrl: string,
    files: any,
    headers: {
        methods: any,
        referer: string,
        origin: string,
        host: string,
    },

    params: any,// url 参数 例如 /a/:name/cc  其中 params.name 就是 name 的值

    path: string,// 请求的路径 
    protocol: string,// 请求的协议
    route: string,//本请求 的 路由路径 
    get: (key: string) => {},// 根据key 读取header的值 例如 get('Content-Type')
    /**
   * 设置session
   * @param key 
   * @param value
   */
    session: (key, value?) => {

    }

    /**
   * 删除session
   * @param key 
   */
    dsession: (key) => {

    }

    $ip: string,// 请求客户端的真实ip地址

}

declare interface cookieOption {
    domain?: string,
    encode?: Function,
    expires?: Date,
    httpOnly?: Boolean,
    maxAge?: number,
    path?: string,
    secure?: boolean,
    signed?: boolean,
    sameSite?: string,
}

/***
 * 系统接口，http 返回对象
 */
declare interface response {

    header: any,
    /**
    * 输出格式化json数据 数据结构为 {err_code:0,data:数据对象}
    * @param obj 数据对象
    */
    ok: (obj: any) => {
    },

    /**
     * 输出模板数据
     * @param tplName 模板的摸名，不含html后缀
     * @param data 数据对象 
     */
    display: (tplName: string, data: any) => {
    },

    render: (tplName: string, data: any) => {},

    /**
    * 向请求端输出错误信息
    * @param obj 错误对象 输出的格式为 {err_code:0,data:obj}
    */
    error: (obj: any) => {
    }

    /**
    * 向请求端输出 中断处理信息 
    * @param msg 错误对象 输出的格式为 {err_code:-1,data:msg}
    */
    stop: (msg: any) => {
    }

    /**
     * 重定向
     * @param url 重定向的地址
     * @param code 301 永久重定向   302 临时重定向
     * @param data query 参数
     * 
     */
    rego:(url:any,code?:number,data?:object)=>
    {
    }


    /**
     * 原生输出
     * @param msg 数据
     * 
     */
    out: (msg: any) =>
        {

        }

    /**
     * 原生输出
     * @param msg 数据
     * 
     */
    send: (msg: any) =>
        {

        }

    /**
     * app 对象
     */
    app: any


    append: (filed: string, value: any) => {

    }

     /**
     * 原生输出
     * @param url 重定向的地址
     * @param code 301 永久重定向   302 临时重定向
     * 
     */
    output:(httpCode,type,msg)=>
    {
        
    }

    attachment: (value?: any) => {}

    /**
     * 
     * 
     */
    cookie: (name: string, value: any, option: cookieOption) => {}

    clearCookie: (name: string, option: cookieOption) => {}

    download: (path: string, fileName: string, func?: (err: any) => {}) => {}

    status: (code: number) => {}

    end: (data?: any) => {}

    json: (data: any) => {}

    jsonp: (data: any) => {}

    links: (links: any) => {}

    location: (path: string) => {}

    redirect: (path: string) => {}

    sendFile: (path: string, option: {

    }, func: (err: any) => {}) => {}

    sendStatus: (code: number) => {}

    set: (key: string, value: string) => {}
    type: (type: string) => {}
    vary: (value: string) => {}
}

