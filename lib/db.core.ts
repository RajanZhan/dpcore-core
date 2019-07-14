
import { Entity } from "@dpCore/Entity"
import utils from "@dpCore/lib/utils"
const { isNumber, isArray } = utils.getType();
const Sequelize = require("sequelize");
// interface dbConfig {
//     host:string,
//     db:string,
//     uname:string,
//     pwd:string,
//     port:number,
//     type?:string,// 目前支持mysql sqlite
//     //storage:string,// 
//     updateFiled:boolean,// 是否自动更新数据模型
//     logging:boolean,// 是否打印sql日志
// }

/**
 * 
 * Sequelize.STRING                      // VARCHAR(255)
Sequelize.STRING(1234)                // VARCHAR(1234)
Sequelize.STRING.BINARY               // VARCHAR BINARY
Sequelize.TEXT                        // TEXT
Sequelize.TEXT('tiny')                // TINYTEXT

Sequelize.INTEGER                     // INTEGER
Sequelize.BIGINT                      // BIGINT
Sequelize.BIGINT(11)                  // BIGINT(11)

Sequelize.FLOAT                       // FLOAT
Sequelize.FLOAT(11)                   // FLOAT(11)
Sequelize.FLOAT(11, 12)               // FLOAT(11,12)

Sequelize.REAL                        // REAL        PostgreSQL only.
Sequelize.REAL(11)                    // REAL(11)    PostgreSQL only.
Sequelize.REAL(11, 12)                // REAL(11,12) PostgreSQL only.

Sequelize.DOUBLE                      // DOUBLE
Sequelize.DOUBLE(11)                  // DOUBLE(11)
Sequelize.DOUBLE(11, 12)              // DOUBLE(11,12)

Sequelize.DECIMAL                     // DECIMAL
Sequelize.DECIMAL(10, 2)              // DECIMAL(10,2)

Sequelize.DATE                        // DATETIME for mysql / sqlite, TIMESTAMP WITH TIME ZONE for postgres
Sequelize.DATE(6)                     // DATETIME(6) for mysql 5.6.4+. Fractional seconds support with up to 6 digits of precision 
Sequelize.DATEONLY                    // DATE without time.
Sequelize.BOOLEAN                     // TINYINT(1)

Sequelize.ENUM('value 1', 'value 2')  // An ENUM with allowed values 'value 1' and 'value 2'
Sequelize.ARRAY(Sequelize.TEXT)       // Defines an array. PostgreSQL only.

Sequelize.JSON                        // JSON column. PostgreSQL only.
Sequelize.JSONB                       // JSONB column. PostgreSQL only.

Sequelize.BLOB                        // BLOB (bytea for PostgreSQL)
Sequelize.BLOB('tiny')                // TINYBLOB (bytea for PostgreSQL. Other options are medium and long)

Sequelize.UUID                        //   PostgreSQL 和 SQLite 中为 UUID, MySQL 中为CHAR(36) BINARY (使用 defaultValue: Sequelize.UUIDV1 或 Sequelize.UUIDV4 生成默认值)

Sequelize.RANGE(Sequelize.INTEGER)    // Defines int4range range. PostgreSQL only.
Sequelize.RANGE(Sequelize.BIGINT)     // Defined int8range range. PostgreSQL only.
Sequelize.RANGE(Sequelize.DATE)       // Defines tstzrange range. PostgreSQL only.
Sequelize.RANGE(Sequelize.DATEONLY)   // Defines daterange range. PostgreSQL only.
Sequelize.RANGE(Sequelize.DECIMAL)    // Defines numrange range. PostgreSQL only.

Sequelize.ARRAY(Sequelize.RANGE(Sequelize.DATE)) // Defines array of tstzrange ranges. PostgreSQL only.

Sequelize.GEOMETRY                    // Spatial column.  PostgreSQL (with PostGIS) or MySQL only.
Sequelize.GEOMETRY('POINT')           // Spatial column with geomerty type.  PostgreSQL (with PostGIS) or MySQL only.
Sequelize.GEOMETRY('POINT', 4326)     
 * 
 * 
 * 
 * 
 */

// 数据类型关系表
const dataTypeMap = [
    Sequelize.STRING,//0
    Sequelize.STRING.BINARY,
    Sequelize.TEXT,
    Sequelize.TEXT('tiny'),
    Sequelize.INTEGER,
    Sequelize.BIGINT,// 5
    Sequelize.FLOAT,
    Sequelize.REAL,//7
    Sequelize.DOUBLE,//8
    Sequelize.DECIMAL,// 9
    Sequelize.DATE,
    Sequelize.DATEONLY,
    Sequelize.BOOLEAN,
    Sequelize.ENUM,
    Sequelize.JSON,
    Sequelize.JSONB,
    Sequelize.BLOB,
    Sequelize.BLOB('tiny'),
    Sequelize.UUID,
]

export default async (dbconfig: Config["db"], entitys: Entity[]) => {
    if (!dbconfig || (dbconfig == undefined) || (dbconfig.use != 1)) {
        return console.log("数据库尚未启用...")
    }

    let models = [];
    for (let entity of entitys) {
        if (entity && entity['prototype']['$Meta']) {
            // 构建 数据库初始化对象
            let dbobj = {
                name: entity['prototype']['$Meta']['$EntityName'],
                tableName: entity['prototype']['$Meta']['$Table'],
                body: {

                    // id: {
                    //     type: Sequelize.STRING(128),
                    //     primaryKey: true,
                    // },
                    // telnum: {
                    //     type: Sequelize.STRING(11),
                    //     allowNull: false,
                    //     alias: "tln"
                    // },
                    // password: {
                    //     type: Sequelize.STRING(32),
                    //     allowNull: true,
                    //     alias: "pwd"
                    // },
                    // type: {
                    //     type: Sequelize.STRING(32),
                    //     allowNull: true,
                    //     alias: "typ"
                    // },
                    // detailId: {
                    //     type: Sequelize.STRING(128),
                    //     allowNull: true,
                    //     alias: "did"
                    // },
                    // remark: {
                    //     type: Sequelize.TEXT,
                    //     allowNull: true,
                    //     alias: "rmk"
                    // },

                    // createTime: {
                    //     type: Sequelize.DATE,
                    //     allowNull: false,
                    //     alias: "ctime"
                    // },


                    // status: {
                    //     type: Sequelize.INTEGER,
                    //     allowNull: true,
                    //     defaultValue: 1,
                    //     alias: "sts"
                    // },


                },
                relation: [
                    // {
                    //     model: "sysUser",
                    //     as: "users",
                    //     through: "sysUserApp",
                    //     foreignKey: "appId",
                    //     type: "belongsToMany"
                    // }, {
                    //     type: "hasMany",
                    //     model: "sysRight",
                    //     as: "appRight",
                    //     targetKey: "appId",
                    //     foreignKey: "appId"
                    // }
                ],

            }

            // 构建字段
            if (!entity['prototype']['$Meta']['$column']) {
                console.log(`实体${entity['prototype']['$Meta']['$EntityName']}的字段属性不合法`)
                continue;
            }
            // 构建字段
            for (let arrt in entity['prototype']['$Meta']['$column']) {
                if (entity['prototype']['$Meta']['$column'][arrt]) {
                    let instance = entity['prototype']['$Meta']['$column'][arrt];
                    let dt = instance.dataType;
                    let type = null;
                    switch (dt) {
                        //string 需要考虑长度
                        case 0:
                            if (instance.length != undefined && instance.length != 'undefined' && instance.length > 0) {
                                type = dataTypeMap[dt](instance.length)
                            }
                            else {
                                type = dataTypeMap[dt];
                            }
                            break;
                        case 5: // bigint
                            if (instance.length != undefined && instance.length != 'undefined' && instance.length > 0) {
                                type = dataTypeMap[dt](instance.length)
                            }
                            else {
                                type = dataTypeMap[dt];
                            }
                            break;
                        case 6: // bigint
                            if (instance.length != undefined && instance.length != 'undefined') {
                                if (isNumber(instance.length)) {
                                    type = dataTypeMap[dt](instance.length)
                                }
                                else if (isArray(instance.length)) {
                                    if (instance.length.length != 2 || (!isNumber(instance.length[0])) || (!isNumber(instance.length[0]))) {
                                        throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法，float类型的length 可以是number类型，
                                        例如 length:12;或者是number数组，例如：length:[8,2]`);
                                    }
                                    type = dataTypeMap[dt](instance.length[0], instance.length[1])
                                }
                                else {
                                    throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法:${instance.length}`);
                                }
                            }
                            else {
                                type = dataTypeMap[dt];
                            }
                            break;
                        case 7: // real
                            if (instance.length != undefined && instance.length != 'undefined') {
                                if (isNumber(instance.length)) {
                                    type = dataTypeMap[dt](instance.length)
                                }
                                else if (isArray(instance.length)) {
                                    if (instance.length.length != 2 || (!isNumber(instance.length[0])) || (!isNumber(instance.length[0]))) {
                                        throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法，real 类型的length 可以是number类型，
                                        例如 length:12;或者是number数组，例如：length:[8,2]`);
                                    }
                                    type = dataTypeMap[dt](instance.length[0], instance.length[1])
                                }
                                else {
                                    throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法:${instance.length}`);
                                }
                            }
                            else {
                                type = dataTypeMap[dt];
                            }
                            break;
                        case 8: // double
                            if (instance.length != undefined && instance.length != 'undefined') {
                                if (isNumber(instance.length)) {
                                    type = dataTypeMap[dt](instance.length)
                                }
                                else if (isArray(instance.length)) {
                                    if (instance.length.length != 2 || (!isNumber(instance.length[0])) || (!isNumber(instance.length[0]))) {
                                        throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法，double类型的length 可以是number类型，
                                        例如 length:12;或者是number数组，例如：length:[8,2]`);
                                    }
                                    type = dataTypeMap[dt](instance.length[0], instance.length[1])
                                }
                                else {
                                    throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法:${instance.length}`);
                                }
                            }
                            else {
                                type = dataTypeMap[dt];
                            }
                            break;
                        case 9: // decimal  length必须是 [m,n]
                            if (instance.length != undefined && instance.length != 'undefined') {
                                if (isArray(instance.length)) {
                                    if (instance.length.length != 2 || (!isNumber(instance.length[0])) || (!isNumber(instance.length[0]))) {
                                        throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法，decimal 类型的length 必须是数值数组]`);
                                    }
                                    type = dataTypeMap[dt](instance.length[0], instance.length[1])
                                }
                                else {
                                    throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                                         字段${arrt}的length设置不合法:${instance.length},decimal类型的length必须是数值数组`);
                                }

                            }
                            else {
                                type = dataTypeMap[dt];
                            }
                            break;
                        default:
                            type = dataTypeMap[dt];
                            break;
                    }
                    if (!type) {
                        throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']}
                        字段${arrt} 读取type类型为空`);
                    }
                    dbobj.body[arrt] = {
                        type: type,
                        allowNull: (instance.allowNull != undefined) || (instance.allowNull != 'undefined') ? instance.allowNull : true,
                        defaultValue: instance.defaultValue,
                        primaryKey: instance.primaryKey,
                        alias: instance.alias,
                    }
                }
            }

            // 处理 普通索引
            if (entity['prototype']['$Meta']['$index']) {
                if (!dbobj['indexes']) {
                    dbobj['indexes'] = []
                }
                dbobj['indexes'][0] = {
                    fields: entity['prototype']['$Meta']['$index'],
                }
            }

            // 处理全文所以
            if (entity['prototype']['$Meta']['$fullTextIndex']) {
                if (!dbobj['indexes']) {
                    dbobj['indexes'] = []
                }
                dbobj['indexes'][1] = {
                    type: "FULLTEXT",// 全文索引
                    fields: entity['prototype']['$Meta']['$fullTextIndex'],
                }
                //dbobj.indexes[1].fields = entity['prototype']['$Meta']['$fullTextIndex'];
            }

            // 处理模型建的关联关系 $Relations
            if (entity['prototype']['$Meta']['$Relations'] && entity['prototype']['$Meta']['$Relations'].length > 0) {

                for (let i in entity['prototype']['$Meta']['$Relations']) {
                    let relation = entity['prototype']['$Meta']['$Relations'][i]
                    if (relation && relation.foreignKey && relation.targetKey) {

                        // 解析外键
                        let fkey = relation.foreignKey;
                        let fkeyEntityArr = fkey.split('.');
                        if (!fkeyEntityArr || (fkeyEntityArr.length != 2) || !fkeyEntityArr[0] || !fkeyEntityArr[1]) {
                            console.log(`实体${entity['prototype']['$Meta']['$EntityName']} 的第${i}个模型关联存在问题，foreignKey：${fkey} 的格式可能不合法`);
                            continue;
                        }
                        // 解析目标键
                        let targetKeyArr = relation.targetKey.split('.');
                        if (!targetKeyArr || (targetKeyArr.length != 2) || !targetKeyArr[0] || !targetKeyArr[1]) {
                            console.log(`实体${entity['prototype']['$Meta']['$EntityName']} 的第${i}个模型关联存在问题，targetKey：${relation.targetKey} 的格式可能不合法`);
                            continue;
                        }

                        switch (relation.type) {
                            // 一对一
                            case "1v1":
                                // 说明外键存在于原模型
                                if (fkeyEntityArr[0] == entity['prototype']['$Meta']['$EntityName']) {
                                    dbobj.relation.push({
                                        model: relation.entityName,
                                        as: relation.as,
                                        targetKey: targetKeyArr[1],
                                        foreignKey: fkeyEntityArr[1],
                                        type: "belongsTo"
                                    })
                                }
                                else {
                                    dbobj.relation.push({
                                        model: relation.entityName,
                                        as: relation.as,
                                        targetKey: targetKeyArr[1],
                                        foreignKey: fkeyEntityArr[1],
                                        type: "hasOne"
                                    })
                                }
                                break;
                            // 一对多
                            case "1vn":
                                // 说明外键存在于目标模型
                                if (fkeyEntityArr[0] == entity['prototype']['$Meta']['$EntityName']) {
                                    throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']} 的第${i}个模型关联存在问题，1对多关联中，外键必须存在于目标模型 `);
                                }
                                else {
                                    dbobj.relation.push({
                                        model: relation.entityName,
                                        as: relation.as,
                                        targetKey: targetKeyArr[1],
                                        foreignKey: fkeyEntityArr[1],
                                        type: "hasMany"
                                    })
                                }
                                break;

                            // 多对多
                            case "nvn":

                                if (!relation.through) {
                                    throw new Error(`实体${entity['prototype']['$Meta']['$EntityName']} 的第${i}个模型关联存在问题，多对多关联中，through字段必须存在 `);
                                }
                                // 说明外键存在于原模型
                                dbobj.relation.push({
                                    model: relation.entityName,
                                    as: relation.as,
                                    targetKey: targetKeyArr[1],
                                    foreignKey: fkeyEntityArr[1],
                                    through: relation.through,
                                    type: "belongsToMany"
                                })
                                break;
                        }
                    }
                }
            }
            models.push(dbobj);
        }
    }

    //return await require("rajan-datamodel")({
    let db = await require("rajan_zhan-datamodel")({
        config: {
            "host": $config.db.host,
            "db": $config.db.db,
            "uname": $config.db.uname,
            "pwd": $config.db.pwd,
            "port": $config.db.port,
            "type": $config.db['type'],
            "storage": $config.db['storage'],
            "updateFiled": $config.db.updateField, // 自动更新模型字段
            "logging": $config.db.logging,
        },
        models: models,
    });
    console.log("数据库初始化完成");
    return db;
    //console.log("db is ",db);
}