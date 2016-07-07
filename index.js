'use strict';
const config = require('config')
const async = require('async')
const redis = require("redis").createClient(config.dbConfig)
const Web3 = require('web3')
const Pool = require('./lib/pool')
const Node = require('./lib/node')
const express = require('express');

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

// initialize web3 component
let web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(config.web3Config))

// bootstrap node
let options = {redis: redis, web3: web3}

let yesPool = new Pool(Object.assign({
  address: config.yesContractAddress,
  type: 'yes'
}, options))

let noPool = new Pool(Object.assign({
  address: config.noContractAddress,
  type: 'no'
}, options))

let node = new Node(Object.assign({
  yesPool: yesPool, noPool: noPool
}, options, config))


// bootstrap web server
let app = express()
app.set('view engine', 'ejs')
app.disable('view cache')
app.use(express.static('public'))

let voteYesAmount = function(callback) {
  redis.get('vote-yes-amount', function(err, res) {
    callback(null, res)
  })
}

let voteNoAmount = function(callback) {
  redis.get('vote-no-amount', function(err, res) {
    callback(err, res)
  })
}

let voteYesTxList = function(callback) {
  redis.lrange('vote-yes-tx-list', 0, 20, function(err, res) {
    callback(err, res)
  })
}

let voteNoTxList = function(callback) {
  redis.lrange('vote-no-tx-list', 0, 20, function(err, res) {
    callback(err, res)
  })
}

let lastBlock = function(callback) {
  redis.get('processedBlockNumber', function(err, res) {
    callback(err, res)
  })
}

app.get('/', function(req, res) {
  let data = {
    yesContractAddress: config.yesContractAddress,
    noContractAddress: config.noContractAddress,
    yesTx: ['tx1', 'tx2', 'tx3'],
    noTx: ['tx1', 'tx2', 'tx3']
  }
  async.parallel([
    voteYesAmount,
    voteNoAmount,
    voteYesTxList,
    voteNoTxList,
    lastBlock
  ], function(error, results) {
    data.yesVote   = results[0] < 0 ? 0 : results[0]
    data.noVote    = results[1] < 0 ? 0 : results[1]
    data.yesTx     = results[2]
    data.noTx      = results[3]
    data.lastBlock = results[4]
    res.render('index', data);
  })
});

app.get('/vote', function(req, res) {
  async.parallel([
    voteYesAmount,
    voteNoAmount
  ], function(error, results) {
    let yesVote = results[0] < 0 ? 0 : results[0]
    let noVote  = results[1] < 0 ? 0 : results[1]
    res.send(JSON.stringify({yes: yesVote, no: noVote}))
  })
})

app.listen(8080);

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
