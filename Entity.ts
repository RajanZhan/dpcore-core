class Entity {

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
    name:string,// 关联的模型名
    type:string,// 关联类型 1v1,nvn,1vn,nv1 
    targetKey:string,// 目标键
    foreignKey:string,// 外键
}
const Relation = (relations:relation[]) => {
    return function (target: any) {
        target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
        target.prototype.$Meta.$EntityName = relations;
    }
}


/**
 * 设置列名
 * @param 
 */
enum DataType {
    int,
    string,
}
interface column {
    dataType:DataType,// 数据类型,
    allowNull?:boolean,
    defaultValue?:any,
    primaryKey?:boolean,
    length?:number,
    alias?:string,// 别名
    index?:string,// 索引
}
 const Colunm = (columnInfo:column ) => {
    // return function (target: any) {
    //     target.prototype.$Meta = target.prototype.$Meta ? target.prototype.$Meta : {}
    //     target.prototype.$Meta.$EntityName = name;
    // }
    return function (target: any, propertyName: string) {
        //target[propertyName] = value;
        target.$Meta = target.$Meta ? target.$Meta : {}
        target.$Meta.$column = target.$Meta.$column ? target.$Meta.$column : {}
        target.$Meta.$column[propertyName] = columnInfo;
    }
}



export {
    Entity,
    Table,
    Name,
    Colunm,
    DataType,
    Relation,
}