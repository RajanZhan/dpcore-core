function getKey (key)
{
    return `${$config.name}-${key}`
}
export default  async ()=> {

    if(!$config || !$config['redis'] || $config['redis']['use'] != '1') 
    {
        console.log("redis未启用");
        return {}
    }
    const redis = await require("./redis")();
    //if(!redis) throw "redis 实例获取失败";
    

    return {
         async get(key){
             try{
                 key = getKey(key);
                 let value = await redis.getSync(key);
                 return  JSON.parse(value) ;
             }
             catch(err)
             {
                 throw err;
             }
        },
        async set(key,value,expire){
             try{
                if((!key) || (!value)){
                    return null;
                }
                key = getKey(key);
                value = JSON.stringify(value);
                if(expire){
                    return await redis.setexSync(key,expire,value);
                }
                else
                {
                    return await redis.setSync(key,value);
                }
             }
             catch(err){
                 throw err;
             }
        },

        async expire(key,expire){
            try{
               if((!key) || (!expire)){
                   return null;
               }
               key = getKey(key);
               return await redis.expire(key,expire);
            }
            catch(err){
                throw err;
            }
       },

        async delete(key){
            try{
                if(!key) return null;
                key = getKey(key);
                return await redis.deleteSync(key);
             }
             catch(err){
                 throw err;
             }
        },
    }
}
