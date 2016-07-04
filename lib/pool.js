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

  if (this.isVote(tx)) {
    this.vote(tx)
  } else {
    this.detectOrUpdateAccount(tx)
  }
}

Pool.prototype.isVote = function(tx) {
  return this.address === tx.to
}

Pool.prototype.vote = function(tx) {
  let self = this
  // check if tx has already processed
  this.redis.sismemberAsync(this.txSetKey, tx.hash).then(function(res) {
    if (res > 0) {
      return
    }

    self.addTx(tx)
    self.addAccount(tx)
  })
}

Pool.prototype.addTx = function(tx) {
  this.redis.multi([
    ['rpush', this.txListKey, tx.hash],
    ['sadd', this.txSetKey, tx.hash]
  ]).exec(function(err, res) {
    console.log('store tx', tx.hash)
  })
}

Pool.prototype.addAccount = function(tx) {
  let self = this
  let account = tx.from

  // detecting if account is come from the opposite pool
  this.redis.hgetAsync(this.accountOppositeHashKey, account).then(function(res) {
    let existBalance = Number(res)
    if (existBalance > 0) {
      self.incrOppositeAmount(-existBalance)
      self.remoteOppositeAccount(account)
    }
  })

  self.addOrUpdateAccount(account)
}

Pool.prototype.remoteOppositeAccount = function(account) {
  console.log('remove account', this.accountOppositeHashKey, account)
  this.redis.hdel(this.accountOppositeHashKey, account)
}

Pool.prototype.incrOppositeAmount = function(balance) {
  console.log('decrease opposite balance', this.amountOppositeKey, balance)
  this.redis.incrbyfloat(this.amountOppositeKey, balance)
}

Pool.prototype.addOrUpdateAccount = function (account) {
  let self = this

  this.redis.hgetAsync(this.accountHashKey, account).then(function(res) {
    let prevBalance = Number(res)
    if (prevBalance > 0) {
      // Remove previous balance from amount
      self.redis.incrbyfloat(self.amountKey, -prevBalance)
    }

    // Update balance to amount
    let wei     = self.web3.eth.getBalance(account)
    let balance = self.web3.fromWei(wei, 'ether').toString()

    console.log('update balance of account', account)
    self.redis.hset(self.accountHashKey, account, balance)

    console.log('update amount', self.amountKey, balance)
    self.redis.incrbyfloat(self.amountKey, balance)
  })
};

Pool.prototype.amount = function() {
  return this.redis.get(this.amountKey)
}

Pool.prototype.detectOrUpdateAccount = function(tx) {
  let self = this

  // FIXME: why I can't mrege below two lines into one
  let addrs = [tx.from, tx.to]
  addrs.forEach(function(account) {
    // skip when tx.to is null
    if (!account) {
      return
    }

    self.redis.hexists(self.accountHashKey, account, function(err, res) {
      if (res > 0) {
        self.addOrUpdateAccount(account)
      }
    })
  })
}

module.exports = Pool
