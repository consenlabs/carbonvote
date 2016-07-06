const async = require('async')

function Pool(args) {
  this.redis   = args.redis
  this.web3    = args.web3
  this.address = args.address

  this.type    = args.type
  this.oppositeType = args.type == 'yes' ? 'no' : 'yes'

  this.blackList = 'vote-account-blacklist'

  this.txListKey = 'vote-' + this.type + '-tx-list'
  this.txSetKey  = 'vote-' + this.type + '-tx-set'

  this.accountHashKey = 'vote-' + this.type + '-account-hash'
  this.accountOppositeHashKey = 'vote-' + this.oppositeType + '-account-hash'

  this.amountKey = 'vote-' + this.type + '-amount'
  this.amountOppositeKey = 'vote-' + this.oppositeType + '-amount'
}

Pool.prototype.process = function(txHash, mainCB) {
  let tx = this.web3.eth.getTransactionReceipt(txHash)

  if (this.isVote(tx)) {
    this.vote(tx, mainCB)
  } else {
    this.detectOrUpdateAccount(tx, mainCB)
  }
}

Pool.prototype.isVote = function(tx) {
  return this.address === tx.to
}

Pool.prototype.vote = function(tx, mainCB) {
  let self = this
  let txHash = tx.transactionHash
  let account = '0x' + tx.logs[0].topics[1].slice(26, 66) // get msg.sender from logs

  function checkTxInBlackList(callback) {
    self.redis.sismember(self.blackList, account, function(err, res) {
      if (res > 0) {
        console.log('vote from blacklist', account)
        return callback(true, res)
      } else {
        return callback(null, res)
      }
    })
  }

  function checkTxHasBeenProcessed(callback) {
    self.redis.sismember(self.txSetKey, txHash, function(err, res) {
      if (res > 0) {
        console.log('tx has been processed', txHash)
        return callback(true, res)
      } else {
        return callback(null, res)
      }
    })
  }

  function addTx(callback) {
    self.redis.multi([
      ['rpush', self.txListKey, txHash],
      ['sadd', self.txSetKey, txHash]
    ]).exec(function(err, res) {
      console.log('store tx', txHash)
      callback(null, res)
    })
  }

  function checkAccountExistsInOpposite(callback) {
    // check account if exists in opposite vote pool
    //   - true
    //     - decrease balance from opposite vote pool
    //     - remove account from opposite vote pool
    //   - false
    //     - return callback to main flow control
    async.waterfall([
      function(cb) {
        self.redis.hget(self.accountOppositeHashKey, account, function(err, res) {
          let balance = Number(res)
          if (balance > 0) {
            cb(null, balance)
          } else {
            cb(true)
          }
        })
      },
      function(balance, cb) {
        self.redis.incrbyfloat(self.amountOppositeKey, -balance, function(err, res) {
          console.log('decrease balance from opposite', self.amountOppositeKey, ':', balance)
          cb(null)
        })
      },
      function(cb) {
        self.redis.hdel(self.accountOppositeHashKey, account, function(err, res) {
          console.log('remove account', self.accountOppositeHashKey, ':', account)
          cb(null)
        })
      }
    ],
    function(err) {
      callback(null, 'done')
    })
  }

  function checkAccountExistsInPool(callback) {
    async.waterfall([
      function(cb) {
        self.redis.hget(self.accountHashKey, account, function(err, res) {
          let prevBalance = Number(res)
          if (prevBalance > 0) {
            cb(null, prevBalance)
          } else {
            cb(true)
          }
        })
      },
      function(prevBalance, cb) {
        self.redis.incrbyfloat(self.amountKey, -prevBalance, function(err, res) {
          cb(null)
        })
      }
    ], function(err) {
      callback(null, 'done')
    })
  }

  function addAccount(callback) {
    let wei     = self.web3.eth.getBalance(account)
    let balance = self.web3.fromWei(wei, 'ether').toString()

    self.redis.multi([
      ['hset', self.accountHashKey, account, balance],
      ['incrbyfloat', self.amountKey, balance]
    ]).exec(function(err, res) {
      console.log('update account', self.accountHashKey, ':', account)
      console.log('update balance', self.amountKey, ':', balance)
      callback(null, res)
    })
  }

  async.series([
    checkTxInBlackList,
    checkTxHasBeenProcessed,
    addTx,
    checkAccountExistsInOpposite,
    checkAccountExistsInPool,
    addAccount
  ], function(err, res) {
    mainCB(null, 'done')
  })
}

Pool.prototype.detectOrUpdateAccount = function(tx, mainCB) {
  let self = this

  // detect if tx.to isn't exists (create contract tx)
  //   account exists in vote pool
  //     get previous account's balance
  //       remove previous balance from amount
  //       add current balance to amount

  async.everySeries([tx.from, tx.to], function(account, escb) {
    async.waterfall([
      function(cb) {
        if (account) {
          cb(null, account)
        } else {
          cb(true) // break flow
        }
      },
      function(account, cb) {
        self.redis.hexists(self.accountHashKey, account, function(err, res) {
          if (res > 0) {
            cb(null, account)
          } else {
            cb(true) // break flow
          }
        })
      },
      function(account, cb) {
        self.redis.hget(self.accountHashKey, account, function(err, res) {
          cb(null, account, Number(res))
        })
      },
      function(account, prevBalance, cb) {
        let wei     = self.web3.eth.getBalance(account)
        let balance = self.web3.fromWei(wei, 'ether').toString()

        self.redis.multi([
          ['incrbyfloat', self.amountKey, -prevBalance],
          ['incrbyfloat', self.amountKey, balance],
          ['hset', self.accountHashKey, account, balance]
        ]).exec(function(err, res) {
          console.log('update account', self.accountHashKey, ':', account)
          console.log('update balance', self.amountKey, ':', balance)
          cb(null)
        })
      }
    ], function(err) {
      escb(null, 'done') // End of async.everySeries
    })
  }, function(err, res) {
    mainCB(null, 'done')
  })
}

module.exports = Pool
