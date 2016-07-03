function Pool(address) {
  this.address = address
}

Pool.prototype.isVote = function(tx) {
  return this.address === tx.to
}

module.exports = Pool
