function Node(db) {
  this.db = db

  return this
}

Node.prototype.hello = function() {
  console.log(this.db)
}

module.exports = Node

