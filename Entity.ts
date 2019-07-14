class Entity {

    //  constructor()
    // {

    // }

    // public static getInstance():Entity
    // {
    //     return new Entity()
    // }
}

/**
 * 设置实体对应的表名
 * @param name 表名
 */
const Table = (name: string) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$Table = name;
    }
}

/**
 * 设置实体名
 * @param name 表名
 */
const Name = (name: string) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$EntityName = name;
    }
}


/**
 * 实体关联
 * @param rule 关联规则
 */
interface relation {
    entityName:string,// 关联的模型名
    type:string,// 关联类型 1v1,nvn,1vn 
    targetKey:string,// 目标键
    foreignKey:string,// 外键
    as:string,// 挂载的对象
    through?:string,// 多对多时的中间模型
}
const Relation = (relations:relation[]) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$Relations = relations;
    }
}

/**
 * 设置列名
 * @param 
 */
enum DataType {
    string,
    stirngBinary,
    text,
    textTiny,
    int,
    bigint,
    float,
    real,// 只支持 PostgreSQL
    double,
    decimal,
    date,
    dateOnly,
    boolean,
    enum,
    json,// 只支持 PostgreSQL
    jsonb,// 只支持 PostgreSQL
    blob,
    blobTiny,
    uuid,
}
interface column {
    dataType:DataType,// 数据类型,
    allowNull?:boolean,
    defaultValue?:any,
    primaryKey?:boolean,
    length?:number|number[],
    alias?:string,// 别名
    index?:string,// 索引
}
 const Colunm = (columnInfo:column ) => {
    return function (target: any, propertyName: string) {
        //target[propertyName] = value;
        target.$Meta = target.$Meta ? target.$Meta : {}
        target.$Meta.$column = target.$Meta.$column ? target.$Meta.$column : {}
        target.$Meta.$column[propertyName] = columnInfo;
    }
}

/**
 * 普通索引
 */
const Index = () => {
    return function (target: any, propertyName: string) {
        target.$Meta = target.$Meta ? target.$Meta : {}
        target.$Meta.$index = target.$Meta.$index ? target.$Meta.$index : []
        target.$Meta.$index.push(propertyName)

    }
}


/**
 * 全文索引
 */
const FullTextIndex = () => {
    return function (target: any, propertyName: string) {
        target.$Meta = target.$Meta ? target.$Meta : {}
        target.$Meta.$fullTextIndex = target.$Meta.$fullTextIndex ? target.$Meta.$fullTextIndex : []
        target.$Meta.$fullTextIndex.push(propertyName)
    }
}



export {
    Entity,
    Table,
    Name,
    Colunm,
    DataType,
    Relation,
    Index,
    FullTextIndex
}