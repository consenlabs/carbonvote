function Pool(args) {
  this.redis   = args.redis
  this.web3    = args.web3
  this.address = args.address
  this.type    = args.type
  this.oppositeType = args.type == 'yes' ? 'no' : 'yes'

  this.txListKey = 'vote-' + this.type + '-tx-list'
  this.txSetKey  = 'vote-' + this.type + '-tx-set'

  this.accountHashKey = 'vote-' + this.type + '-account-hash'

  this.amountKey = 'vote-' + this.type + '-amount'
}

Pool.prototype.isVote = function(tx) {
  return this.address === tx.to
}

Pool.prototype.process = function(tx) {
  let self = this

  // check if tx has already processed
  this.redis.sismemberAsync(this.txSetKey, tx.hash).then(function(res) {
    if (res > 0) {
      return
    }

    self.processTx(tx)
    self.processAccount(tx)
  })
}

Pool.prototype.processTx = function(tx) {
  this.redis.multi([
    ['rpush', this.txListKey, tx.hash],
    ['sadd', this.txSetKey, tx.hash]
  ]).exec(function(err, res) {
    console.log('store tx', tx.hash)
  })
}

Pool.prototype.processAccount = function(tx) {
  let self = this
  let voteAccount = tx.from

  // detecting if account is voting again
  this.redis.hgetAsync(this.accountHashKey, voteAccount).then(function(res) {
    let existBalance = Number(res)
    if (existBalance > 0) {
      return
    }

    let wei     = self.web3.eth.getBalance(voteAccount)
    let balance = self.web3.fromWei(wei, 'ether').toString()
    self.redis.hset(self.accountHashKey, voteAccount, balance)
    self.incrAmount(balance)
  })
}

Pool.prototype.incrAmount = function(n) {
  this.redis.incrbyfloat(this.amountKey, n)
}

Pool.prototype.decrAmount = function(n) {
  this.redis.decrbyfloat(this.amountKey, n)
}

Pool.prototype.amount = function() {
  return this.redis.get(this.amountKey)
}

module.exports = Pool
