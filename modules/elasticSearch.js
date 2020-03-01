const elasticsearch       = require('elasticsearch');
const _async              = require('async');
const elasticSearchClient = new elasticsearch.Client({
    host: process.env.DB_HOST
});
module.exports = {
    connecttoElasticSearch: function() {
        return new Promise((resolve, reject) => {
            console.log('trying to connect');
            elasticSearchClient.ping({
              requestTimeout: 10000
            }, function (error) {
              if (error) {
                console.log('elastic search error',error);
                resolve({error:1,code:342,message:"db connecton error",error:error});
              } else {
                console.log('elastic search connected');
                resolve({error:0});
              }
            });
        });
    },
    createIndex: function() {
        return new Promise(async (resolve, reject) => {
            let conn = await this.connecttoElasticSearch();
            elasticSearchClient.indices.create({
                index: "contents",
                body: {
                    "mappings" : {
                    "properties" : {
                        "name" : { "type" : "text" },
                        "poster-image" : { "type" : "text" },
                        "added-time":{ "type" : "keyword","index":true}
                    }
                    
                }
                }
            }, function (err, resp, respcode) {
                if(err) {
                    reject('error');
                } else {
                    resolve('success');
                }
            });
        });
    },
    insertContent: function(contents) {
        return new Promise(async (resolve, reject) => {
            let conn = await this.connecttoElasticSearch();
            _async.each(contents,function(content,calback){
                content['added-time'] = new Date().getTime();
                elasticSearchClient.index({  
                index: 'contents',
                type: '_doc',
                body:content
                },function(err,resp,status) {
                    console.log(resp,content);
                    calback();
                });
            },function(err) {
                resolve(200);
            });
        });
    },
    fetchContent : function(offset=0,limit=20) {
        return new Promise(async (resolve, reject) => {
            let conn = await this.connecttoElasticSearch();
            if(conn.error == 1) {
                resolve(conn);
            } else {
                elasticSearchClient.search({
                index: 'contents',
                type: '_doc',
                body: {
                    "_source": ["name","poster-image","added-time"],
                    from:offset,
                    size:limit,
                    sort: {
                        "added-time": {
                            "order": "asc"
                        }
                    }
                }
                }, (error, response) => {
                    if (error) {
                        resolve({error:1,code:345,message:"query error",error:error})
                    } else {
                        let data = response.hits.hits;
                        let resp = [];
                        for(let i=0;i<data.length;i++) {
                            resp.push(data[i]._source);
                        }
                        resolve(resp);
                    }     
                });
            }
          });
    },
    searchContent : function(keyword) {
        return new Promise(async (resolve, reject) => {
            let conn = await this.connecttoElasticSearch();
            if(conn.error == 1) {
                resolve(conn);
            } else {
                elasticSearchClient.search({
                index: 'contents',
                type: '_doc',
                body: {
                    "_source": ["name","poster-image","added-time"],
                    "query": {
                    "bool": {
                        "must": [
                            {
                                "wildcard": {
                                    "name": "*"+keyword+"*"
                                }
                            }
                        ]
                    }
                },
                    size:1000,
                    sort: {
                        "added-time": {
                            "order": "asc"
                        }
                    }
                }
                }, (error, response) => {
                    if (error) {
                        reject({error:1,code:345,message:"query error",error:error})
                    } else {
                        let data = response.hits.hits;
                        let resp = [];
                        for(let i=0;i<data.length;i++) {
                            resp.push(data[i]._source);
                        }
                        resolve(resp);
                    }     
                });
            }
          });
      }
}