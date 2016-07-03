function Node(db) {
  this.db = db

  return this
}

Node.prototype.stop = function() {
  // do something before stop
  console.log('Stopping node process...')
}

module.exports = Node
