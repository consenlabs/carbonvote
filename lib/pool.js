function Pool(args) {
  this.redis   = args.redis
  this.web3    = args.web3
  this.address = args.address

  this.type    = args.type
  this.oppositeType = args.type == 'yes' ? 'no' : 'yes'

  this.txListKey = 'vote-' + this.type + '-tx-list'
  this.txSetKey  = 'vote-' + this.type + '-tx-set'

  this.accountHashKey = 'vote-' + this.type + '-account-hash'
  this.accountOppositeHashKey = 'vote-' + this.oppositeType + '-account-hash'

  this.amountKey = 'vote-' + this.type + '-amount'
  this.amountOppositeKey = 'vote-' + this.oppositeType + '-amount'
}

Pool.prototype.process = function(tx) {
  let self = this

  if (this.isntVote(tx)) {
    return
  }

  // check if tx has already processed
  this.redis.sismemberAsync(this.txSetKey, tx.hash).then(function(res) {
    if (res > 0) {
      return
    }

    self.processTx(tx)
    self.processAccount(tx)
  })
}

Pool.prototype.isntVote = function(tx) {
  return this.address !== tx.to
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

  // detecting if account is come from the opposite
  this.redis.hgetAsync(this.accountOppositeHashKey, voteAccount).then(function(res) {
    let existBalance = Number(res)
    if (existBalance > 0) {
      self.decrOppositeAmount(existBalance)
      self.remoteOppositeAccount(voteAccount)
    }
  })

  // detecting if account is repeated vote
  this.redis.hgetAsync(this.accountHashKey, voteAccount).then(function(res) {
    let existBalance = Number(res)
    if (existBalance > 0) {
      return
    }

    let wei     = self.web3.eth.getBalance(voteAccount)
    let balance = self.web3.fromWei(wei, 'ether').toString()

    self.storeAccount(voteAccount, balance)
    self.incrAmount(balance)
  })
}

Pool.prototype.storeAccount = function(account, balance) {
  console.log('store account', account)
  this.redis.hset(this.accountHashKey, account, balance)
}

Pool.prototype.remoteOppositeAccount = function(account) {
  console.log('remove account', this.accountOppositeHashKey, account)
  this.redis.hdel(this.accountOppositeHashKey, account)
}

Pool.prototype.incrAmount = function(n) {
  console.log('increase balance', this.amountKey, n)
  this.redis.incrbyfloat(this.amountKey, n)
}

Pool.prototype.decrOppositeAmount = function(n) {
  console.log('decrease opposite balance', this.amountOppositeKey, -n)
  this.redis.incrbyfloat(this.amountOppositeKey, -n)
}

Pool.prototype.amount = function() {
  return this.redis.get(this.amountKey)
}

module.exports = Pool
