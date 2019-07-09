{
    const innerObject = {
        /**
         * 根据控制器的的名称 方法名，请求类型 获取 url
         * @param {string} path 控制器名.方法名.请求类型 如 user.add.get
         */
        URL(path: string) {
            if (!path) {
                throw new Error("生成url时，参数不能为空");
            }
            let arr = path.split('.');
            if (arr.length != 3) {
                throw new Error("生成url时，参数格式不正确 ：" + path);
            }
            let url = $ControllerUrlMap.get(path)
            if (!url) {
                throw new Error("_URL_生成url失败,可能对应的控制器或者方法不存在:" + path);
            }
            return innerObject.STC(url);
        },
        /**
         * 读取静态文件的url地址
         * @param {string} path 控制器名.方法名.请求类型 如 user.add.get
         */
        STC(path: string) {
            if (!path) {
                throw new Error("生成静态文件url时，参数不能为空");
            }
            let url = "";
            if ($config['staticRootPah']) {
                url = `${$config['staticRootPah'] + path}`;
            }
            else {
                url = path
            }
            return url.replace(/\/\//g, '/')
        },

        // 将query对象生成url参数
        urlEncode: (data:object, paramProxy = '') => Object.keys(data).map(key => { if (paramProxy) { return `${paramProxy}[${key}]=${encodeURIComponent(data[key])}` } return `${key}=${encodeURIComponent(data[key])}` }).join('&')

    }
    //console.log($common)
    const { isEmptyObject } = $common.getType()

    const response = {

        /**
        * 统一输出
        * @param {any}  - 错误信息.
        */
        out(msg) {
            if (typeof msg == 'number') {
                return this.send(`${msg}`);
            }
            this.send(msg);
            //$common.writeLog(log);
        },


        /**
        * 返回服务器错误信息.status 为 500
        * @param {any}  - 错误信息.
        */
        error(msg, log) {
            //this.status(500);
            this.success({ err_code: -1, err_msg: msg })
            //this.out(msg);
            //$common.writeLog(log);
        },

        /**
         * 接口拒绝处理此请求，可能权限不足.status 为 403
         * @param {any}  - 错误信息.
         */
        nauth(msg) {
            this.status(403);
            this.out(msg);
        },

        /**
        * 接口拒绝处理此请求，可能是授权信息不合法.status 为 202 服务器已接受请求，但尚未处理。
        * @param {any}  - 错误信息.
        */
        deny(msg) {
            this.status(202);
            this.out(msg);
        },

        /**
         *提交的信息不合法，请重新修正后再提交.status 为 402
         * @param {any}  - 错误信息.
         */
        stop(msg) {
            // this.status(402);
            // this.out(msg);
            this.success({ err_code: 1, err_msg: msg })
        },

        /**
         * 处理成功.status 为 200
         * @param {any}  - 错误信息.
         */
        success(msg) {
            //this.status(200);
            this.status(200);
            this.out(msg);
        },

        /**
         * 处理成功.status 为 200
         * @param {any}  - 错误信息.
         */
        ok(msg) {
            //this.status(200);
            this.status(200);
            this.success({ err_code: 0, data: msg });
        },

        /**
        * 重定向
        * @param url 重定向的地址
        * @param c 301 永久重定向   302 临时重定向
        * @param data query参数 对象
        * 
        */
        rego(url, c, data?: object) {
            let code = c ? c : 302;
            if (url.indexOf("@") != -1) {
                url = url.replace(/@/g, '')
                url = innerObject.URL(url)
                if (data && !isEmptyObject(data)) {


                    let query = innerObject.urlEncode(data);
                    url = `${url}?${query}`
                }

            }
            this.redirect(code, url);
        },

        /**
         * 根据可控制器名字 生成url
         */
        _URL_: (url: string) => {
            return innerObject.URL(url)
        },

        /**
        * 渲染模板输
        * @param {tpl}  - 模板的名称，无需添加后缀，比如模板index.html，只需要传入index，即可，模板的路径在config.viewPath中定义.
        * @param {data}  - 即将要渲染的数据.
        */
        display(tp: string, data: any) {

            if (!tp || !data) {
                throw new Error("display输出时，模板名或者输出数据不能为空");
            }
            data['_URL_'] = innerObject.URL;
            data['_STC_'] = innerObject.STC;
            this.render(tp, data)

        },
        URL: innerObject.URL,// 根据字符串 控制器名.方法名.请求类型 如 user.add.get 读取完整的url



    }


    module.exports = new Proxy(response, {
        get: function (target, property) {
            if (property in target) {
                return target[property];
            } else {
                throw new Error(`调用了Response 中 不存在的方法 ${<string>property}`)
            }
        }
    });




}

