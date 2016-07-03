const UPDATE_INTERVAL = 5000;

function Node(db) {
  this.db = db

  this.startPolling()

  return this
}

Node.prototype.update = function() {
  console.log('update database')
}

Node.prototype.startPolling = function() {
  let self = this
  this.updateInterval = setInterval(function() {
    self.update()
  }, UPDATE_INTERVAL)
}

Node.prototype.stop = function() {
  // do something before stop
  console.log('Stopping node process...')
}

module.exports = Node
