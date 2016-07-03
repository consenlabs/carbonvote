const Pool = require('./pool')

function Node(app) {
  this.redis = app.redis
  this.web3  = app.web3
  this.startBlockNumber = app.startBlockNumber
  this.timeout = 15000

  this.yesPool = new Pool(app.yesContractAddress)
  this.noPool  = new Pool(app.noContractAddress)

  this.init()
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

Node.prototype.startFetching = function() {
  let self = this

  function getProcessedBlockNumber() {
    return self.redis.getAsync('processedBlockNumber').then(function(res) {
      return Number(res || self.startBlockNumber)
    })
  }

  function processBlock(processedBlockNumber) {
    let currentBlockNumber = self.web3.eth.blockNumber
    if (currentBlockNumber > processedBlockNumber) {
      let blockNumber = processedBlockNumber + 1
      console.log('processing block...', blockNumber)

      let txIds = self.web3.eth.getBlock(blockNumber).transactions
      txIds.forEach(function(txId) {
        let tx = self.web3.eth.getTransaction(txId)

        if (self.yesPool.isVote(tx)) {
          console.log(tx)
        } else if (self.noPool.isVote(tx)) {
          console.log(tx)
        }
      })

      return self.redis.set('processedBlockNumber', blockNumber)
    } else {
      return false
    }
  }

  function reEntryTask(res) {
    if (self.stopping) {
      return
    }

    if (res) {
      setTimeout(self.startFetching.bind(self), 500)
    } else {
      console.log('Wait for 15 seconds and then continue...')
      setTimeout(self.startFetching.bind(self), self.timeout)
    }
  }

  getProcessedBlockNumber().then(processBlock).then(reEntryTask)
}

Node.prototype.stop = function() {
  this.stopping = true

  console.log('Stopping node process...')
}

module.exports = Node
