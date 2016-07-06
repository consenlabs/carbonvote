const async = require('async')

function Node(args) {
  this.redis = args.redis
  this.web3  = args.web3
  this.startBlockNumber = args.startBlockNumber
  this.timeout = 15000

  this.yesPool = args.yesPool
  this.noPool  = args.noPool

  if (process.env.POLL === 'true') {
    this.init()
  }
}

Node.prototype.init = function() {
  if (this.web3.isConnected()) {
    console.log('Web3 connection established.')
    console.log('Start fetching data ...')

    this.startFetching()
  } else {
    console.log('Web3 connection failed.')
    this.stop()
  }
}

Node.prototype.getBlockNumber = function() {
  var number = 0;
  try {
    number = this.web3.eth.blockNumber - 6
  } catch(e) {
  } finally {
    return number
  }
}

Node.prototype.startFetching = function() {
  if (this.stopping) {
    return
  }

  let self = this

  async.waterfall([
    function(callback) {
      self.redis.get('processedBlockNumber', function(err, res) {
        let processedBlockNumber = Number(res || self.startBlockNumber)
        if (self.getBlockNumber() > processedBlockNumber) {
          callback(null, processedBlockNumber + 1)
        } else {
          callback(true)
        }
      })
    },
    function(blockNumber, callback) {
      console.log('processing block...', blockNumber)
      let txHashs = self.web3.eth.getBlock(blockNumber).transactions

      async.everySeries(txHashs, function(txHash, escb) {
        async.series([
          function(cb) {
            self.yesPool.process(txHash, cb)
          },
          function(cb) {
            self.noPool.process(txHash, cb)
          }
        ], function(err, result) {
          escb(null, 'done') // End of async.series
        })
      }, function(err, results) {
        callback(null, blockNumber) // End of async.everySeries
      })

    },
    function(blockNumber, callback) {
      self.redis.set('processedBlockNumber', blockNumber, function(err, res) {
        callback(null, res)
      })
    }
  ], function(err) {
    if (err) {
      console.log('Wait for 15 seconds and then continue...')
      setTimeout(self.startFetching.bind(self), self.timeout)
    } else {
      setTimeout(self.startFetching.bind(self), 500)
    }
  })
}

Node.prototype.stop = function() {
  this.stopping = true

  console.log('Stopping node process...')
}

module.exports = Node
