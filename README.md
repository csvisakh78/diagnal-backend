# diagnal-backend
application for test


 => Two API endpoint are there.<br />
    => Fetching contents from elasticsearch based on offset and limit (for pagination).<br />
    => Search Content based on name (first check in redis whether same keyword search result is available.<br />
      else fallback to db for fetching and write back the result to redis.Now redis having a caching TTL of 10 minutes).  <br />
=> API have public access now<br />
=> Two API used POST method
      
