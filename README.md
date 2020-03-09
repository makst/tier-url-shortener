- [About](#about)
- [Installation](#installation)
- [Tests](#tests)
- [Quick test examples](#quick-test-examples)

About
===
The project uses design first approach of building REST APIs with Swagger v2. So, in order to define new routes,
it's needed to add them to swagger.yml first, and then create handlers and/or controllers as specified in swagger.yml,
by convention. Response/request validation is handled by swagger middleware.

Installation
===
1. Install dependencies
```
$ npm i
```
2. Create `docker-compose-api.env` file with the following contents
```
LOG_LEVEL=debug
PORT=3000
SWAGGER_EDITOR_PORT=3003
NODE_ENV=development
MONGO_DB_URL=mongodb://db/test
MONGO_DB_CONNECTION_RETRY_INTERVAL=5000
MONGO_DB_CONNECTION_RETRIES=10
SHORT_URL_BASE=http://localhost:3000

```
3. Create `.env` with the following contents
```
LOG_LEVEL=debug
PORT=3000
SWAGGER_EDITOR_PORT=3003
NODE_ENV=development
```
4. Set up docker environment
```
$ npm run docker:up
```

5. Follow logs
```
$ npm run docker:logs
```

Example output
```
$ npm run docker:logs

> tier-url-shortener-api@0.0.1 docker:logs /Users/makst/repos/github/tier-url-shortener
> docker-compose logs --follow

Attaching to tier-url-shortener-api
tier-url-shortener-api |
tier-url-shortener-api | > tier-url-shortener-api@0.0.1 start /www
tier-url-shortener-api | > node -r dotenv/config lib/api/index.js
tier-url-shortener-api |
tier-url-shortener-api | (node:19) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version. To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor.
tier-url-shortener-api | 2020-03-09T07:03:45.196Z - info: Starting on port 3000
tier-url-shortener-api | 2020-03-09T07:03:45.227Z - error: Db connection error message=failed to connect to server [db:27017] on first connect [Error: connect ECONNREFUSED 192.168.32.3:27017
tier-url-shortener-api |     at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1137:16) {
tier-url-shortener-api |   name: 'MongoNetworkError',
tier-url-shortener-api |   [Symbol(mongoErrorContextSymbol)]: {}
tier-url-shortener-api | }], stack=MongoNetworkError: failed to connect to server [db:27017] on first connect [Error: connect ECONNREFUSED 192.168.32.3:27017
tier-url-shortener-api |     at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1137:16) {
tier-url-shortener-api |   name: 'MongoNetworkError',
tier-url-shortener-api |   [Symbol(mongoErrorContextSymbol)]: {}
tier-url-shortener-api | 2020-03-09T07:11:04.769Z - info: POST /v1/shorten 200 150 - 34.844 ms
tier-url-shortener-api |
tier-url-shortener-api | 2020-03-09T07:12:13.733Z - info: GET /v1/4ca838 301 156 - 5.612 ms
tier-url-shortener-api |
tier-url-shortener-api | 2020-03-09T07:13:20.815Z - info: GET /v1/stats/4ca838 200 161 - 10.671 ms
tier-url-shortener-api |
tier-url-shortener-api | 2020-03-09T07:13:32.247Z - info: GET /v1/stats/4ca838 200 161 - 3.075 ms
```

6. Edit swagger.yml live - http://localhost:3003

Tests
===
Only API tests are available, as unit tests would be too fragile to use them extensively in the very
beginning of the app lifecycle. Too many low-level details could change.
```
$ npm run test:api
```

Example output
```
$ npm run test:api

> tier-url-shortener-api@0.0.1 test:api /Users/makst/repos/github/tier-url-shortener
> mocha -r dotenv/config --require @babel/register test/api.js



  API test
    /unknown/resourse
      ✓ returns 404
    /v1/shorten
      ✓ returns shortened url response
    /v1/stats
      ✓ returns stats url response
    /v1/{shortUrl}
      ✓ redirect to the corresponding long url
      ✓ redirects should increment visits (59ms)


  5 passing (148ms)
```

Quick test examples
===

- `v1/shorten`
  ```
  $ curl -X POST "http://localhost:3000/v1/shorten" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"longUrl\": \"https://swagger.io/docs/specification/2-0/describing-request-body/\"}"
    {"status":"success","data":{"shortUrl":"http://localhost:3000/4ca838","longUrl":"https://swagger.io/docs/specification/2-0/describing-request-body/"}}
  ```

- `v1/{shortUrlHash}`
  ```
  $ curl -iX GET "http://localhost:3000/v1/4ca838"
    HTTP/1.1 301 Moved Permanently
    X-Powered-By: Express
    Location: https://swagger.io/docs/specification/2-0/describing-request-body/
    Content-Type: text/html; charset=utf-8
    Content-Length: 156
    ETag: W/"9c-5iLIPu8CovIlU5O/ZLoSod87fuM"
    Date: Mon, 09 Mar 2020 07:12:13 GMT
    Connection: keep-alive

    <html>
    <head><title>TIER.app</title></head>
    <body><a href="https://swagger.io/docs/specification/2-0/describing-request-body/">moved here</a></body>
    </html>
  ```

- `v1/stats/{shortUrlHash}`
    ```
    $ curl -X GET "http://localhost:3000/v1/stats/4ca838"
    {"status":"success","data":{"shortUrl":"http://localhost:3000/4ca838","longUrl":"https://swagger.io/docs/specification/2-0/describing-request-body/","visits":1}}
    ```
