const express = require('express');
const async = require('async')

function Web(args) {
  this.redis = args.redis
  this.yesContractAddress = args.yesContractAddress
  this.noContractAddress = args.noContractAddress
}

Web.prototype.init = function() {
  this.app = express()
  this.app.set('view engine', 'ejs')
  this.app.disable('view cache')
  this.app.use(express.static('public'))

  let self = this

  let voteYesAmount = function(callback) {
    self.redis.get('vote-yes-amount', function(err, res) {
      callback(null, res)
    })
  }

  let voteNoAmount = function(callback) {
    self.redis.get('vote-no-amount', function(err, res) {
      callback(err, res)
    })
  }

  let voteYesTxList = function(callback) {
    self.redis.lrange('vote-yes-tx-list', 0, 20, function(err, res) {
      callback(err, res)
    })
  }

  let voteNoTxList = function(callback) {
    self.redis.lrange('vote-no-tx-list', 0, 20, function(err, res) {
      callback(err, res)
    })
  }

  let lastBlock = function(callback) {
    self.redis.get('processedBlockNumber', function(err, res) {
      callback(err, res)
    })
  }

  this.app.get('/', function(req, res) {
    async.parallel([
      voteYesAmount,
      voteNoAmount,
      voteYesTxList,
      voteNoTxList,
      lastBlock
    ], function(error, results) {
      res.render('index', {
        yesContractAddress : self.yesContractAddress,
        noContractAddress  : self.noContractAddress,
        yesVote            : results[0] < 0 ? 0 : results[0],
        noVote             : results[1] < 0 ? 0 : results[1],
        yesTx              : results[2],
        noTx               : results[3],
        lastBlock          : results[4]
      });
    })
  });

  this.app.get('/vote', function(req, res) {
    async.parallel([
      voteYesAmount,
      voteNoAmount
    ], function(error, results) {
      res.send(JSON.stringify({
        yes : results[0] < 0 ? 0 : results[0],
        no  : results[1] < 0 ? 0 : results[1]
      }))
    })
  })

  this.app.listen(8080);
}

module.exports = Web
