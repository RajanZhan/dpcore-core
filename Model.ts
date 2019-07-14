import utils from "./lib/utils"
let { isArray, isString, isObject } = utils.getType();
import { OriginClass, Params, Returns, Desc } from "./lib/origin"


//事务对象
interface transaction {
    commit: () => {},
    rollback: () => {}
}


// 读数据 基础的查询参数的
interface readBaseParam {
    where?: any,
    orderBy?: any,
    $fields?: {
        [key: string]: any;
        exclude?: string[],//忽略哪些字段
    } | any,
    include?: any,
    $cache?: {
        time: number,
        key: string
    },

}

// 读数据查询的options 选项
interface readBaseOption {
    transaction?: transaction
}

// 写入数据的options选项
interface writeBaseOption {
    $ignoreFields?: string[],
    transaction?: transaction
}



// findAll 的参数
interface findAllParam extends readBaseParam {

    page?: number,
    psize?: number,

}

// findOne 的参数
interface findOneParam extends readBaseParam {

}


interface findMany {
    (data: findAllParam, option?: readBaseOption): Promise<any[]>
}

interface findAll {
    (data: findAllParam, option?: readBaseOption): Promise<{
        res: any[],
        count: number,
    }>
}


interface findOne {
    (data: findOneParam, option?: readBaseOption): Promise<any>
}

interface create {
    (data: any, option?: writeBaseOption): Promise<any>
}

interface createMany {
    (data: any[], option?: writeBaseOption): Promise<any>
}

interface upsert {
    (data: object, option?: writeBaseOption): Promise<any>
}

interface destroyParams {
    where: object,
    limit?: number,// 删除的行数限制
    transaction?: transaction
}
interface destroy {
    (data: destroyParams): Promise<any>
}

interface updateOption extends writeBaseOption {
    where: object,
    limit?: number,// 改动的行数限制

}
interface update {
    (data: object, option?: updateOption): Promise<any>
}

interface count {

    (option: {
        where: object,
        include?: any,
        distinct?: boolean,
        transaction?: transaction
    }): Promise<any>
}

interface max {

    (filed: string, option?: {
        where: object,
        include?: any,
        distinct?: boolean,
        transaction?: transaction
    }): Promise<any>
}

interface min {

    (filed: string, option?: {
        where: object,
        include?: any,
        distinct?: boolean,
        transaction?: transaction
    }): Promise<any>
}
interface sum {

    (filed: string, option?: {
        where: object,
        include?: any,
        distinct?: boolean,
        transaction?: transaction
    }): Promise<any>
}


// model 方法的返回值 接口
interface modelBack {
    findOne: findOne, findAll: findAll, create: create, createMany: createMany, upsert: upsert,
    destroy: destroy, update: update, count: count, max: max, min: min, sum: sum, findMany: findMany,
}

class Model extends OriginClass {

    models: any;
    callLoigc: any;//调用当前model的logic
    private $App: any;// 应用实例

    constructor() {
        super();
        this.models = $db.models;
        //this.entity =  this.model
    }


    /**
     * 设置应用对象
     * @param App 全局应用对象
     */
    public set App(App) {
        this.$App = App;
    }

    public get App() {
        return this.$App;
    }


    /**
     * 启用原生查询
     * @param sql {string} sql 语句
     */
    protected async query(sql: string) {
        return await $db['query'](sql)
    }


    /**
    * 完成数据字段的映射 从虚拟字段 转为 真实字段
    * @param fields  字段列表
    * @param modelname 模型名称
    * @returns data 映射完成后的数据对象
    */
    private changeToRealField(fields: any, modelname: string) {

        // console.log(typeof fields);
        // console.log(fields);
        if (isString(<any>fields)) {
            //fields = eval(<any>fields)
            fields = fields.replace(/\[/g, "").replace(/\]/g, "").replace(/'/g, "").split(',');

        }

        if (!isArray(fields)) {
            console.log(fields, typeof fields, modelname);
            throw new Error("fields 只能为数组 ，in changeToRealField in Base.model.model:");
        }
        if (!$modelFieldMap) {
            throw new Error("$modelFieldMap 变量为空 ，无法转换字段映射 model:" + modelname);
        }
        let modelMap = <any>$modelFieldMap.get(modelname);
        if (!modelMap) {
            throw new Error("该数据模型的字段映射不存在 ，无法转换字段映射 model:" + modelname);
        }
        let tmparr = [];
        for (let f of fields) {
            if (f) {
                let real = modelMap.get(f);
                if (real) {
                    tmparr.push(real);
                }
            }
        }

        return tmparr;
    }

    /**
     * 调用数据模型，并且返回操作方法
     * @param dataModelName 数据模型名
     */
    entity(dataModelName: string): modelBack {
        return this.model(dataModelName);
    }

    /**
     * 调用数据模型，并且重写findOne findAll 方法 用于数据字段的映射
     * @param dataModelName  数据模型名
     * @returns {findOne:function,findAll:function}
     */
    private model(dataModelName: string): modelBack {

        var _this = this;

        // 载入数据类型判断 函数
        let { isObject, isArray } = $common.getType();

        /**
        * 根据模型名的虚拟字段，读取真实字段
        * @param vf 虚拟字段
        * @param dataModelName  数据模型
        */
        let getRealFieldByVirtualField = (vf: any, dataModelName: string) => {
            if (!vf || !dataModelName) {
                throw new Error("getRealFieldByVirtualField 中 vf 或者 dataModelName 为空 ");
            }

            let vtrMap = <any>$modelFieldMap.get(dataModelName);
            if (!vtrMap) {
                throw new Error(`getRealFieldByVirtualField vtr 字段映射失败 model:${dataModelName},字段:${vf} 虚拟字段映射到真实字段发生异常,可能是模型不存在,请确认所操作模型是否导入`);
            }
            let rf = vtrMap.get(vf);// 读取虚拟字段
            if (!rf) {
                return false;
                throw new Error(`getRealFieldByVirtualField vtr字段映射失败 model:${dataModelName},字段:${vf}`);
            }
            return rf;
        }

        /**
        * 根据模型名的真实字段，读取虚拟字段
        * @param vf 虚拟字段
        * @param dataModelName  数据模型
        */
        let getVirtualFieldByRealField = (rf: any, dataModelName: string) => {
            if (!rf || !dataModelName) {
                throw new Error("getRealFieldByVirtualField 中 vf 或者 dataModelName 为空 ");
            }
            let rtvMap = <any>$realFieldToVfieldMap.get(dataModelName);
            let vf = rtvMap.get(rf);// 读取虚拟字段
            if (!vf) {
                return false;
            }
            return vf;

        }

        /**
         * 改变数据体的字段为真实字段
         * @param data where字段
         * @param dataModelName 数据模型
         */
        let changeDataFieldToReal = (data: any, dataModelName: string) => {
            let dtmp = {};
            //let vtrMap = <any>$modelFieldMap.get(dataModelName);
            //console.log("字段映射",vtrMap);

            // 系统保留的字符串
            let keyWord = new Set(['$gte', '$lt', '$lte', '$ne', '$not', '$between', '$notBetween', '$in', '$notIn'
                , '$like', '$notLike', '$iLike', '$notILike', '$like', '$overlap', '$contains', '$contained',
                '$any', '$col', '$and', '$or', '$gt'
            ])
            //console.log("isobj",isObject);

            let handle = (oriobj) => {

                let obj = <any>JSON.parse(JSON.stringify(oriobj))
                let saveobj = {};

                if (!obj) {
                    return null;
                }

                for (let i in obj) {

                    if (keyWord.has(i)) {
                        if (isObject(obj[i])) {
                            saveobj[i] = handle(obj[i])
                        }
                        else {
                            saveobj[i] = obj[i];
                        }
                    }
                    else {
                        let rf = getRealFieldByVirtualField(i, dataModelName);
                        if (!rf) {
                            continue;
                        }
                        saveobj[`${rf}`] = obj[i];
                        if (isObject(obj[i])) {
                            saveobj[`${rf}`] = handle(obj[i])
                        }
                    }

                }

                return saveobj;
            }

            dtmp = handle(data);
            //console.log('真实的where 映射', dtmp);
            return dtmp;

        }


        /**
         * 处理数据查询的列，由虚拟的字段列 转换为真实的字段列
         * @param obj 
         * @param dataModelName 
         */
        let getAttribute = (obj: any, dataModelName: string) => {

            let realFields = [];
            if (obj.$fields && obj.$fields.exclude) {
                // 如果没有查询的列，则默认只查询主键 
                let primaryKey = <any>$modelPrimaryKeyMap.get(dataModelName);
                if (!primaryKey) {
                    throw new Error("模型主键查询失败，model " + dataModelName);
                }

                realFields = _this.changeToRealField(obj.$fields.exclude, dataModelName);

                return { exclude: realFields };
            }
            else {
                if (obj.$fields == "*") {
                    return { exclude: [] };
                }
                // 如果没有查询的列，则默认只查询主键 
                let primaryKey = <any>$modelPrimaryKeyMap.get(dataModelName);
                if (!primaryKey) {
                    throw new Error("模型主键查询失败，model " + dataModelName);
                }
                if (obj.$fields) {

                    realFields = _this.changeToRealField(obj.$fields, dataModelName);
                    realFields.unshift(primaryKey.realField);
                    //console.log("get atrr",realFields);
                }
                else {

                    realFields = [`${primaryKey.realField}`]
                }
                return realFields;
            }

        }

        var checker = (obj, type) => {

            // 处理order的虚拟字段的
            let dealOrderVirtualField = (obj) => {
                let newOrderBy = [];
                if (!obj.order && obj.orderBy) // 如果调用了原生的order，na
                {
                    if (obj.orderBy.length > 0) {

                        for (let order of obj.orderBy) {
                            if (order.length == 2) {
                                //将 order 的虚拟字段转换成
                                //let tmpOrder = order;
                                let rf = getRealFieldByVirtualField(order[0], dataModelName);
                                if (!rf) {
                                    throw new Error(`数据模型：${dataModelName} ，  orderBy属性中，字段${order[0]} 无法映射为真实字段，请确保该字段存在 `);
                                }
                                order[0] = rf;
                                newOrderBy.push(order);
                            }
                        }
                    }
                }
                return newOrderBy;
            }

            //处理include中的查询到的数据也转化为虚拟字段的问题
            let includeQueryMap = new Map(); // 存储 本次include 字段的相关数据 
            let includeFields = new Set();//存储 本次include 字段
            //let perIncludeResult = new Map();// 存储每个include 字段对应的modelName
            // 处理include参数的问题
            let dealInclude = (obj, dataModelName?: string) => {
                let tobj = null;
                if (isArray(obj)) {
                    tobj = [];
                    for (let i in obj) {
                        if (!obj[i].modelName) {
                            throw new Error(`dealInclude 出错，modelName 为空 in for，${JSON.stringify(obj[i])}`);
                        }
                        if (obj[i] && isObject(obj[i])) {
                            tobj[i] = dealInclude(obj[i], obj[i].modelName)
                        }
                    }
                }
                else if (isObject(obj)) {
                    dataModelName = dataModelName ? dataModelName : obj.modelName
                    if (!dataModelName) {
                        throw new Error(`dealInclude 出错，modelName 为空,，${JSON.stringify(obj)}`);
                    }
                    if (!obj.as) {
                        throw new Error(`dealInclude 出错，as 参数不能 为空,，${JSON.stringify(obj)}`);
                    }


                    tobj = JSON.parse(JSON.stringify(obj))

                    tobj['attributes'] = getAttribute(obj, dataModelName)

                    if (obj['where']) {
                        tobj['where'] = changeDataFieldToReal(obj['where'], dataModelName)
                    }

                    tobj['model'] = $db.models[dataModelName];

                    if (obj['include']) {
                        tobj['include'] = dealInclude(obj['include'])
                    }
                    // 默认include 中查询的内容都是虚拟字段， 如果开启真实字段，realFields参数 为true
                    if (obj.realFields == undefined || !obj.realField) {
                        // 表示要将include 的结果 进行虚拟字段转化
                        includeQueryMap.set(obj.as, obj);
                        includeFields.add(obj.as); // 说明该字段是 include 查询到的 字段 
                    }
                    delete tobj.modelName;
                    delete tobj.$fields;
                }
                else {
                    throw new Error(`dealInclude 出错，处理的数据对象不是object类型,modelname:${dataModelName}，${JSON.stringify(obj)}`);
                }
                tobj['$includeResultOptions'] = {
                    includeQueryMap,
                    includeFields
                }
                return tobj;

            }


            if (type == 'findOne') {

                obj['attributes'] = getAttribute(obj, dataModelName); // 读取查询的数据列
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);
                //console.log(obj);
                // 处理orderby 排序
                obj['order'] = dealOrderVirtualField(obj);
                if (obj['include']) {
                    obj['include'] = dealInclude(obj['include'])
                }
                return obj;
            }
            else if (type == 'findAll') {


                let limit = null;
                let offset = null;
                if (obj.page != -1) {
                    let pagnition = <any>$common.getPageForSql(obj.page, obj.psize);
                    limit = pagnition.limit;
                    offset = pagnition.offset;
                    obj['limit'] = limit;
                    obj['offset'] = offset;
                }
                obj['attributes'] = getAttribute(obj, dataModelName);;
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);


                // 处理orderby 排序
                obj['order'] = dealOrderVirtualField(obj);
                if (obj['include']) {
                    obj['include'] = dealInclude(obj['include'])
                    //console.log("findAll  include",dealInclude(obj['include']));
                    //delete obj.include
                }
                //console.log(obj);
                return obj;
            }
            else if (type == 'findMany') {


                let limit = null;
                let offset = null;
                if (obj.page != -1) {
                    let pagnition = <any>$common.getPageForSql(obj.page, obj.psize);
                    limit = pagnition.limit;
                    offset = pagnition.offset;
                    obj['limit'] = limit;
                    obj['offset'] = offset;
                }
                obj['attributes'] = getAttribute(obj, dataModelName);;
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);


                // 处理orderby 排序
                obj['order'] = dealOrderVirtualField(obj);
                if (obj['include']) {
                    obj['include'] = dealInclude(obj['include'])
                    //console.log("findAll  include",dealInclude(obj['include']));
                    //delete obj.include
                }
                //console.log(obj);
                return obj;
            }
            else if (type == 'count') {

                obj['attributes'] = getAttribute(obj, dataModelName); // 读取查询的数据列
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);
                //console.log(obj);
                // 处理orderby 排序
                return obj;
            }
            else if (type == 'max') {
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);
                return obj;
            }
            else if (type == 'min') {
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);
                return obj;
            }
            else if (type == 'sum') {
                obj['where'] = changeDataFieldToReal(obj.where ? obj.where : {}, dataModelName);
                return obj;
            }
            else if (type == 'create') {
                let data = changeDataFieldToReal(obj, dataModelName);
                return data;
            }
            else if (type == 'createMany') {
                if (!isArray(obj)) {
                    throw new Error("checker 数据合法性检测时发生错误，createMany 中传入的数据不是数组");
                }
                let data = [];
                for (let i in obj) {
                    data[i] = changeDataFieldToReal(obj[i], dataModelName);
                }
                //let data = changeDataFieldToReal(obj, dataModelName);
                return data;
            }
            else if (type == 'upsert') {
                let data = changeDataFieldToReal(obj, dataModelName);
                return data;
            }
            else if (type == 'update') {
                let data = changeDataFieldToReal(obj, dataModelName);
                return data;
            }
            else if (type == 'destroy') {
                return {
                    where: obj.where
                }
            }
            else {
                throw new Error("Base.Model error in checker,未知查询类型");
            }

        }
        // 处理查询的结果
        var dealResult = (data: any, dataModelName: string) => {

            // let fastJson = require('fast-json-stringify');
            // console.log(fastJson);
            if (!data) {
                return data
            }
            let rtvMap = <any>$realFieldToVfieldMap.get(dataModelName);
            if ($common.isArray(data)) {
                let res = []
                for (let d of data) {
                    if (d) {
                        let dtmp = {};
                        for (let k in d.dataValues) {
                            let vf = rtvMap.get(k);// 读取虚拟字段
                            if (!vf) {
                                // throw new Error(`虚拟字段读取失败 model:${dataModelName},字段:${k}`);
                                dtmp[`${k}`] = d.dataValues[k];
                            }
                            else {
                                dtmp[`${vf}`] = d.dataValues[k];
                            }

                        }
                        res.push(dtmp);
                    }
                }
                return res;
                //return JSON.parse(JSON.stringify(res));
            }
            else {
                let dtmp = {};
                for (let k in data.dataValues) {
                    let vf = rtvMap.get(k);// 读取虚拟字段
                    if (!vf) {
                        // throw new Error(`虚拟字段读取失败 model:${dataModelName},字段:${k}`);
                        dtmp[`${k}`] = data.dataValues[k];;
                    }
                    else {
                        dtmp[`${vf}`] = data.dataValues[k];;
                    }
                }
                return dtmp;
                //return JSON.parse(JSON.stringify(dtmp));
            }
        }

        // 处理include查询结果的真实字段转为虚拟字段的问题
        let dealIncludeResult = (res, option) => {
            if (!res) {
                return res;
            }
            let includeFields = option['$includeResultOptions']['includeFields'];
            let includeQueryMap = option['$includeResultOptions']['includeQueryMap'];
            if (includeFields && includeQueryMap) {
                // 处理将真实字段转为虚拟字段的问题
                if (isArray(res)) {
                    let tmpres = [];
                    for (let r of res) {
                        if (r) {
                            let tmp = dealIncludeResult(r, option);
                            if (tmp) {
                                tmpres.push(tmp)
                            }
                        }
                    }
                    return tmpres
                }
                // 本逻辑中才是真正的处理 include result 的数据 
                else if (isObject(res)) {

                    for (let i in res) {
                        if (includeFields.has(i)) // 说明是关联查询的结果集
                        {
                            let includeObj = includeQueryMap.get(i);
                            let modelName = includeObj.modelName;
                            // 接下来开始进行 真实字段转为虚拟字段的操作
                            if (isArray(res[i])) {
                                for (let j in res[i]) {
                                    let target = res[i][j].dataValues;
                                    let result = {};
                                    if (target && modelName) {
                                        for (let j in target) {
                                            if (target[j]) {

                                                if (!isObject(target[j])) {
                                                    let vf = getVirtualFieldByRealField(j, modelName);
                                                    if (!vf) {
                                                        continue;
                                                    }
                                                    result[vf] = target[j]
                                                    //delete target[j];
                                                }
                                                else // 递归转换
                                                {
                                                    result[j] = dealIncludeResult(target[j], option['include'])
                                                    //delete target[j];
                                                }
                                            }
                                        }

                                    }
                                    res[i][j] = result;
                                }

                            }
                            else if (isObject(res[i])) {
                                let target = res[i].dataValues;
                                let result = {};
                                if (target && modelName) {
                                    for (let j in target) {
                                        if (target[j]) {
                                            let vf = getVirtualFieldByRealField(j, modelName);
                                            if (!vf) {
                                                continue;
                                            }
                                            if (!isObject(target[j])) {
                                                result[vf] = target[j]
                                                //delete target[j];
                                            }
                                            else // 递归转换
                                            {
                                                result[vf] = dealIncludeResult(target[j], option['include'])
                                                //delete target[j];
                                            }
                                        }
                                    }
                                }
                                res[i] = result;
                            }
                            else {
                                continue;
                            }

                        }
                    }
                }
                else {
                    throw new Error("无法将关联查询到的结果进行真实字段到虚拟字段的改动，因为输入的目标数据仅支持数组和对象");
                }
            }
            return res;
        };

        let findOne = async (obj: any) => {
            let data = checker(obj, 'findOne');
            let res = null;

            var setCache = (obj, res) => {
                let cacheTime = obj.$cache.time ? Number(obj.$cache.time) : Number($config.cacheDefaultExpire)
                res = dealResult(res, dataModelName);
                $cache.set(obj.$cache.key, res, cacheTime)
                return res;
            }

            // 说明启用了缓存查询
            if ($config.redis.use == '1' && obj.$cache) {
                if (obj.$cache.key) {
                    res = await $cache.get(obj.$cache.key)
                    if (!res) // 缓存中没有，则需要查询数据库
                    {
                        res = <any>await $db.models[dataModelName].findOne(data);
                        if (res) {
                            res = setCache(obj, res);
                            //console.log("findone 缓存中没有  读SQL",);
                        }
                    }
                    else {

                        //console.log("findone 读缓存",res);

                    }
                }
            }
            else {
                res = <any>await $db.models[dataModelName].findOne(data);

                // 处理 result 中 include 数据集 真实字段转为虚拟字段的问题
                if (data['include']) {
                    res = dealResult(res, dataModelName);
                    res = dealIncludeResult(res, data['include']) // 处理将真实字段转为虚拟字段的问题
                }
                else {
                    res = dealResult(res, dataModelName);
                }

            }

            //根据结果处理 将真实的字段转换为将虚拟字段
            return res;
        }

        let findAll = async (obj: any) => {
            let data = <any>checker(obj, 'findAll');
            //console.log(data.where)

            let result = null; // 存放统一的输出结果

            var setCache = (obj, res, count) => {
                let cacheTime = obj.$cache.time ? Number(obj.$cache.time) : Number($config.cacheDefaultExpire)
                //res = dealResult(res, dataModelName);
                if (data['include']) {
                    res = dealResult(res, dataModelName);
                    res = dealIncludeResult(res, data['include']) // 处理将真实字段转为虚拟字段的问题
                }
                else {
                    res = dealResult(res, dataModelName);
                }
                $cache.set(obj.$cache.key, { res, count }, cacheTime)
                return { res, count };
            }

            let res = null;// 存放数据集
            let count = 0; // 存放查询的数量
            let where = data.where;

            // 说明启用了缓存查询
            if ($config.redis.use == '1' && obj.$cache) {
                if (obj.$cache.key) {
                    result = await $cache.get(obj.$cache.key)
                    if (!result) // 缓存中没有，则需要查询数据库
                    {

                        res = <any>await $db.models[dataModelName].findAll(data);
                        count = <any>await $db.models[dataModelName].count({ where: where });
                        if (res) {
                            result = setCache(obj, res, count);
                            //console.log("findAll 缓存中没有  读SQL",);
                        }
                    }
                    else {

                        //console.log("findAll 读缓存",result);
                    }
                }
            }
            else {

                res = <any>await $db.models[dataModelName].findAll(data);
                count = <any>await $db.models[dataModelName].count({ where: where });
                //根据结果处理 将真实的字段转换为将虚拟字段

                if (data['include']) {
                    res = dealResult(res, dataModelName);
                    res = dealIncludeResult(res, data['include']) // 处理将真实字段转为虚拟字段的问题
                }
                else {
                    res = dealResult(res, dataModelName);
                }
                result = {
                    res, count
                }
            }

            return result;
        }
        let findMany = async (obj: any): Promise<any[]> => {
            let data = <any>checker(obj, 'findMany');
            //console.log(data.where)

            let result = null; // 存放统一的输出结果

            var setCache = (obj, res) => {
                let cacheTime = obj.$cache.time ? Number(obj.$cache.time) : Number($config.cacheDefaultExpire)
                //res = dealResult(res, dataModelName);
                if (data['include']) {
                    res = dealResult(res, dataModelName);
                    res = dealIncludeResult(res, data['include']) // 处理将真实字段转为虚拟字段的问题
                }
                else {
                    res = dealResult(res, dataModelName);
                }
                $cache.set(obj.$cache.key, res, cacheTime)
                return res;
            }

            let res = null;// 存放数据集
            //let count = 0; // 存放查询的数量
            //let where = data.where;

            // 说明启用了缓存查询
            if ($config.redis.use == '1' && obj.$cache) {
                if (obj.$cache.key) {
                    result = await $cache.get(obj.$cache.key)
                    if (!result) // 缓存中没有，则需要查询数据库
                    {

                        res = <any>await $db.models[dataModelName].findAll(data);
                        //count = <any>await $db.models[dataModelName].count({ where: where });
                        if (res) {
                            result = setCache(obj, res);
                            //console.log("findAll 缓存中没有  读SQL",);
                        }
                    }
                    else {

                        //console.log("findAll 读缓存",result);
                    }
                }
            }
            else {

                res = <any>await $db.models[dataModelName].findAll(data);
                //count = <any>await $db.models[dataModelName].count({ where: where });
                //根据结果处理 将真实的字段转换为将虚拟字段

                if (data['include']) {
                    res = dealResult(res, dataModelName);
                    res = dealIncludeResult(res, data['include']) // 处理将真实字段转为虚拟字段的问题
                }
                else {
                    res = dealResult(res, dataModelName);
                }

                result = res;
            }

            return result;
        }

        let count = async (obj: any) => {
            let data = checker(obj, 'count');
            return await $db.models[dataModelName].count(data);;
        }

        let max = async (field: string, obj?: any) => {
            let data = checker(obj, 'max');
            let rf = getRealFieldByVirtualField(field, dataModelName);
            if (!rf) {
                throw new Error(`max ${field},${dataModelName},读取真实字段失败`);
            }
            return await $db.models[dataModelName].max(rf, data);
        }

        let min = async (field: string, obj?: any) => {
            let data = checker(obj, 'min');
            let rf = getRealFieldByVirtualField(field, dataModelName);
            if (!rf) {
                throw new Error(`min ${field},${dataModelName},读取真实字段失败`);
            }
            return await $db.models[dataModelName].min(rf, data);;
        }

        let sum = async (field: string, obj?: any) => {
            let data = checker(obj, 'sum');
            let rf = getRealFieldByVirtualField(field, dataModelName);
            if (!rf) {
                throw new Error(`sum ${field},${dataModelName},读取真实字段失败`);
            }
            return await $db.models[dataModelName].sum(rf, data);;
        }


        let create = async (obj: any, opt?: any) => {
            let data = {};
            var set = new Set();
            if (opt) {
                let igoreField = opt.$ignoreFields;
                if (igoreField && igoreField.length > 0) {
                    set = new Set(igoreField);
                }
            }
            for (let i in obj) {
                if (set.has(i)) {
                    continue;
                }
                data[i] = obj[i]
            }

            data = checker(data, 'create');
            //console.log("创建的数据", data);
            let res = <any>await $db.models[dataModelName].create(data, opt);
            //根据结果处理 将真实的字段转换为将虚拟字段
            res = dealResult(res, dataModelName);
            return res;
        }

        // 创建多条数据
        let createMany = async (obj: any, opt?: any) => {
            if (!isArray(obj)) {
                throw new Error("createMany 创建数据时，接收一个数组的数据，请传入一个数组进来");
            }
            let data = {};
            let saveData = [];
            var set = new Set();
            if (opt) {
                let igoreField = opt.$ignoreFields;
                if (igoreField && igoreField.length > 0) {
                    set = new Set(igoreField);
                }
            }

            for (let d of obj) {
                if (d) {
                    data = {};
                    for (let i in d) {
                        if (set.has(i)) {
                            continue;
                        }
                        data[i] = d[i]
                    }
                    saveData.push(data);
                }
            }

            saveData = checker(saveData, 'createMany');
            //console.log("创建的数据", data);
            let res = <any>await $db.models[dataModelName].bulkCreate(saveData, opt);
            //根据结果处理 将真实的字段转换为将虚拟字段
            res = dealResult(res, dataModelName);
            return res;
        }

        let upsert = async (obj: any, opt?: any) => {
            let data = {};
            var set = new Set();
            if (opt) {
                let igoreField = opt.$ignoreFields;
                if (igoreField && igoreField.length > 0) {
                    set = new Set(igoreField);
                }
            }
            for (let i in obj) {
                if (set.has(i)) {
                    continue;
                }
                data[i] = obj[i]
            }

            data = checker(data, 'upsert');
            //console.log("创建的数据", data);
            let res = <any>await $db.models[dataModelName].upsert(data, opt);
            //根据结果处理 将真实的字段转换为将虚拟字段
            res = dealResult(res, dataModelName);
            return res;
        }

        let destroy = async (obj: any) => {
            let data = checker(obj, 'destroy');
            //console.log("删除条件",data);
            let res = <any>await $db.models[dataModelName].destroy(data);
            return res;
        }

        let update = async (obj: any, where: { where: any, $ignoreFields?: any }, ) => {
            let data = checker(obj, 'update');
            if (!where || !where.where) {
                throw new Error("无法执行update操作，因为缺少where 条件")
            }
            where.where = checker(where.where, "update");
            let ignoreFields = where.$ignoreFields;
            if (ignoreFields) {

                // 转换为真实的字段
                ignoreFields = _this.changeToRealField(ignoreFields, dataModelName);

                // 读取所有真实的字段
                let vtrMap = <any>$modelFieldMap.get(dataModelName);
                let vfs = vtrMap.values();

                // 忽略的字段 
                let ignrField = new Set(ignoreFields);

                // 本次修改的字段
                var tmpField = [];

                for (let v of vfs) {

                    if (!ignrField.has(v)) {
                        tmpField.push(v);
                    }
                }
                where['fields'] = tmpField
                //console.log("本次修改的字段", where);
            }
            //console.log(ignoreFields);
            let res = <any>await $db.models[dataModelName].update(data, where);
            return res;
        }
        // var _this = this;
        // let getTransaction = async ()=>{
        //     return _this.getTransaction
        // }
        return {
            findAll,
            findMany,
            findOne,
            create,
            createMany,
            upsert,
            update,
            destroy,
            count,
            max,
            min,
            sum,
        }
    }

    /**
     * 获取开启事物对象 
     */
    async getTransaction(): Promise<transaction> {

        return new Promise((resolve, reject) => {

            let ta = <any>$db.transaction()
            ta.then((t) => {
                resolve(t)
            });
        })
    }



    /**
     * 默认首先的执行的方法 在这里需要对参数进行 字段映射的还原 
     * @param action  调用的方法
     * @param params  对应的参数
     */
    async _init(action, params) {
        //console.log("父类的 init");
        return params;
    }
}

export {
    Model, Params, Returns, Desc
}

