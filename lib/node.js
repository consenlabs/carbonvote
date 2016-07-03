function Node(options) {
  this.db   = options.db
  this.web3 = options.web3
  this.startBlockNumber = options.config.startBlockNumber
  this.timeout = 15000

  this.init()

  return this
}

Node.prototype.init = function() {
  if (this.web3.isConnected()) {
    console.log('Web3 connection established.');
    console.log('Start fetching data ...');

    this.startFetching()
  } else {
    console.log('Web3 connection failed.')
    this.stop()
  }
}

Node.prototype.startFetching = function() {
  var self = this

  function getProcessedBlockNumber() {
    return self.db.getAsync('processedBlockNumber').then(function(res) {
      return Number(res || self.startBlockNumber)
    })
  }

  function processBlock(processedBlockNumber) {
    var currentBlockNumber = self.web3.eth.blockNumber
    if (currentBlockNumber > processedBlockNumber) {
      var blockNumber = processedBlockNumber + 1
      console.log('processing block...', blockNumber)
      return self.db.set('processedBlockNumber', blockNumber)
    } else {
      return false
    }
  }

  function reEntryTask(res) {
    if (res) {
      setTimeout(self.startFetching.bind(self), 100)
    } else {
      console.log('Wait for 15 seconds and then continue...')
      setTimeout(self.startFetching.bind(self), self.timeout)
    }
  }

  getProcessedBlockNumber().then(processBlock).then(reEntryTask)
}

Node.prototype.stop = function() {
  console.log('Stopping node process...')
}

module.exports = Node
