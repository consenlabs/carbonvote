const UPDATE_INTERVAL = 5000;

function Node(options) {
  this.db   = options.db
  this.web3 = options.web3

  this.init()

  return this
}

Node.prototype.init = function() {
  if (this.web3.isConnected()) {
    console.success('Web3 connection established.');
    this.startPolling()
  } else {
    console.error('Web3 connection failed.')
    this.stop()
  }
}

Node.prototype.update = function() {
  console.log('update database.')
}

Node.prototype.startPolling = function() {
  console.success('Start polling data ...');

  let self = this

  this.updateInterval = setInterval(function() {
    self.update()
  }, UPDATE_INTERVAL)
}

Node.prototype.stop = function() {
  if(this.updateInterval) {
    clearInterval(this.updateInterval);
  }

  console.log('Stopping node process...')
}

module.exports = Node
