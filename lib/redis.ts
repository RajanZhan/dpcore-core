const redis = require("redis");
var redisInstance = null;

module.exports = () => {
    return new Promise((success, fail) => {
        var config = $config.redis;
        if ((!config) || (config.use != "1")) return null;
        if ((!config) || (!config.host) || (!config.port)) throw "redis 配置信息为空，无法配置";
        if (redisInstance) return success(redisInstance);
        let client = redis.createClient(config.port, config.host, {
            auth_pass: config.pass
        });
        client.on("ready", (res) => {
            console.log("redis cache init ok ");
            redisInstance = client;
            success(redisInstance);
        });

        client.on("error", (error) => {
            console.error("redis cache init error ",error);
            fail(error);
        });

        client.keysSync = (keywords) => {
            if (!keywords) keywords = "*";
            return new Promise((resolve, reject) => {
                client.keys(keywords, (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                })
            })
        }

        client.expireSync = (key, second) => {
            return new Promise((resolve, reject) => {
                if (!key) reject("redis.js expireSync errir:key can not be empty ");
                client.expire(key, second, (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                })
            })
        }

        client.getSync = (key) => {
            return new Promise((resolve, reject) => {
                client.get(key, (err, value) => {
                    if (err) {
                        reject({
                            position: "cache.get",
                            err: err
                        });
                        return;
                    }
                    resolve(JSON.parse(value));
                })
            });
        }

        client.setexSync = (key, expire, value) => {
            return new Promise((resolve, reject) => {
                value = JSON.stringify(value);
                client.setex(key, expire, value, (err, value) => {
                    if (err) {
                        reject({
                            position: "redis.setexSync",
                            err: err
                        });
                        return;
                    }
                    resolve(value);
                })
            });
        }

        client.setSync = (key, value) => {
            return new Promise((resolve, reject) => {
                value = JSON.stringify(value);
                client.set(key, value, (err, value) => {
                    if (err) {
                        reject({
                            position: "redis.setSync",
                            err: err
                        });
                        return;
                    }
                    resolve(value);
                })
            });
        }

        client.deleteSync = (key) => {
            return new Promise((resolve, reject) => {
                if (!key) {
                    reject({
                        position: "redis.deleteSync",
                        err: "key can not be empty"
                    });
                    return;
                }
                client.del(key, (err, value) => {
                    if (err) {
                        reject({
                            position: "redis.deleteSync",
                            err: err
                        });
                        return;
                    }
                    resolve(JSON.stringify(value));
                })
            });
        }
        //return redisInstance;
    })
}