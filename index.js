const config = require('config')
const redis  = require("redis").createClient(config.dbConfig)
const Node   = require(__dirname + '/lib/node')
const Web    = require(__dirname + '/lib/web')


// initialize redis connection
redis.on("connect", function() {
  console.log("Redis connected.")

  // populate black list
  config.blackList.forEach(function(address) {
    redis.sadd('vote-account-blacklist', address)
  })
})
redis.on("error", function(err) {
  console.log("Redis Error ", err)
})

let options = Object.assign({redis: redis}, config)

// bootstrap node
let node = new Node(options)
if (process.env.POLL === 'true') {
  node.init()
}

// bootstrap web server
let web = new Web(options)
if (process.env.WEB == 'true') {
  web.init()
}

// Graceful shotdown application
let gracefulShutdown = function() {
  console.log('Received kill signal, shutting down gracefully.')

  node.stop()
  redis.quit()

  setTimeout(function(){
    process.exit(0)
  }, 1500)
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown)

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown)

// listen for shutdown signal from pm2
process.on('message', function(msg) {
  if (msg == 'shutdown') {
    gracefulShutdown()
  }
})
