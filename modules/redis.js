const redis       = require('redis');
const REDIS_URL = process.env.REDIS_HOST;
var clientRedis;
module.exports = {
    redisConnection:function() {
        return new Promise(resolve => {
            clientRedis = redis.createClient(REDIS_URL); 
            clientRedis.on('connect', () => {
                console.log('redis connected');
                resolve(true);
            });
            clientRedis.on('error', err => {
              console.log('redis error',err);
                resolve(false);
            });
        });
    },
    searchinCache: function(key) {
        return new Promise(async(resolve) => {
          let conn = await this.redisConnection();
          if(conn) {
            console.log('---------search cache-----------------',key);
            clientRedis.get(key,function(err,data) {
              if(data && data!=null) {
                resolve(JSON.parse(data));
              } else {
                resolve([]);
              }
            });
          } else {
            resolve([]);
          }
        });
    },
    saveinCache: function(key,data) {
        return new Promise(async(resolve) => {
          let conn = await this.redisConnection();
          if(conn) {
            console.log('---------saving to cache-----------------',key,data);
            clientRedis.set(key,data,'EX',600,function(err,res) {
              resolve(true);
            });
          } else {
            resolve(false);
          }
        });
      }
}