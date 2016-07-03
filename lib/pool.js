function Pool(args) {
  this.redis   = args.redis
  this.web3    = args.web3
  this.address = args.address
  this.type    = args.type
  this.oppositeType = args.type == 'yes' ? 'no' : 'yes'
}

Pool.prototype.isVote = function(tx) {
  return this.address === tx.to
}

Pool.prototype.process = function(tx) {
  let self = this
  let listName = 'vote-' + this.type + '-tx-list'
  let setName  = 'vote-' + this.type + '-tx-set'

  // check if tx has already processed
  this.redis.sismemberAsync(setName, tx.hash).then(function(res) {
    if (res > 0) {
      return
    }

    self.redis.multi([
      ['rpush', listName, tx.hash],
      ['sadd', setName, tx.hash]
    ]).exec(function(err, res) {
      console.log('process tx', tx.hash)
    })
  })

}

module.exports = Pool
