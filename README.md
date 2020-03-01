# diagnal-backend
application for test


 => Two API endpoint are there.\n
    => Fetching contents from elasticsearch based on offset and limit (for pagination).\n
    => Search Content based on name (first check in redis whether same keyword search result is available.
      else fallback to db for fetching and write back the result to redis.Now redis having a caching TTL of 10 minutes).  
=> API have public access now
=> Two API used POST method
      
