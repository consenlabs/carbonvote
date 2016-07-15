const Web3 = require('web3')
const async = require('async')
const Pool = require(__dirname + '/pool')

function Node(args) {
  this.redis = args.redis

  this.web3  = new Web3()
  this.web3.setProvider(new this.web3.providers.HttpProvider(args.web3Config))

  this.startBlockNumber = args.startBlockNumber
  this.endBlockNumber = args.endBlockNumber

  this.timeout = 15000

  this.yesPool = new Pool(Object.assign({type: 'yes', web3: this.web3}, args))
  this.noPool  = new Pool(Object.assign({type: 'no', web3: this.web3}, args))
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

Node.prototype.getCurrentBlockNumber = function() {
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
    console.log("Stopped the loop of fetching data from remote...")
    return
  }

  let self = this

  async.waterfall([
    function(callback) {
      self.redis.get('processedBlockNumber', function(err, res) {
        let processedBlockNumber = Number(res || self.startBlockNumber)
        let currentBlockNumber = self.getCurrentBlockNumber()

        if (processedBlockNumber >= self.endBlockNumber) {
          console.log("Reach the end of block number", self.endBlockNumber)
          self.stop()
          callback(true)
        } else if (currentBlockNumber > processedBlockNumber) {
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
        let tx = self.web3.eth.getTransactionReceipt(txHash)
        async.series([
          function(cb) {
            self.yesPool.process(tx, cb)
          },
          function(cb) {
            self.noPool.process(tx, cb)
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
