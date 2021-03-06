const serverless    = require('serverless-http');
const express       = require('express');
const bodyParser    = require('body-parser')
const es_fn         = require('./modules/elasticSearch');
const redis_fn      = require('./modules/redis');
const cors          = require('cors');
const app       = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use((req, res, next) => {
  var allowedOrigins = ['http://localhost:3000', 'https://csvisakh78.github.io'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.get('/', function (req, res) {
  res.sendStatus(200);
});
// app.post('/createIndex',async function(req,res) {
//   let result = await es_fn.createIndex();
//   res.send(result);
// });
// app.post('/deleteIndex',async function(req,res) {
//   let result = await es_fn.deleteIndex();
//   res.send(result);
// });
// app.post('/insertContent',async function(req,res) {
//   let result = await es_fn.insertContent(req.body.content);
//   res.send(result);
// });
app.post('/fetchContents', async function (req, res) {
  let contents = await es_fn.fetchContent(req.body.offset,req.body.limit);
  res.send(contents);
});
app.post('/searchContents', async function (req, res) {
  let cacheResult = await redis_fn.searchinCache('query_'+req.body.keyword);
  if(cacheResult && cacheResult.length > 0 ) {
    return res.send(cacheResult);
  }
  let contents = await es_fn.searchContent(req.body.keyword);
  if(contents.error!=1) {
    await redis_fn.saveinCache('query_'+req.body.keyword,JSON.stringify(contents));
  }
  return res.send(contents);
});


module.exports.handler = serverless(app);