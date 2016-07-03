const config = require('config')
const redis = require('redis')
const Web3 = require('web3')
const nodeModel = require('./lib/node')

let db = redis.createClient(config.dbConfig)

let web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(config.web3Config))

let node = new nodeModel({db: db, web3: web3})

let gracefulShutdown = function() {
  console.log('Received kill signal, shutting down gracefully.');

  node.stop();

  setTimeout(function(){
    process.exit(0);
  }, 1000);
}

// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown)

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown)

// listen for shutdown signal from pm2
process.on('message', function(msg) {
  if (msg == 'shutdown')
    gracefulShutdown();
});

module.exports = node;
