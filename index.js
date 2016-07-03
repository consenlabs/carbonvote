const config = require('config')
const db = require('redis').createClient(config.dbConfig)
const nodeModel = require('./lib/node')

let node = new nodeModel(db)

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
