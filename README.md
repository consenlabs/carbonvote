# CarbonVote

## Requirements
* node
* redis


```
var voteContract = web3.eth.contract([{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"}],"name":"LogVote","type":"event"}]);

var vote = voteContract.new({
  from: web3.eth.accounts[0],
  data: '606060405260978060106000396000f360606040523615600d57600d565b60955b3373ffffffffffffffffffffffffffffffffffffffff167fd66fd10d93c3fcf37a27c11c0e12214976632505c7954b53c023093d843fc1c460405180905060405180910390a260003411156092573373ffffffffffffffffffffffffffffffffffffffff16600034604051809050600060405180830381858888f19350505050505b5b565b00',
  gas: 4700000
}, function (e, contract){
  console.log(e, contract);
  if (typeof contract.address !== 'undefined') {
    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
  }
})
```


```
Testnet
address: 0x90c6178979f2290d3e973911cacff3df25b7d1e1 block: 1261638
address: 0x4664405e8219d4e5809fc59cfe48b5ff4d14b65a block: 1261642

Production
address: 0x3039d0a94d51c67a4f35e742b571874e53467804 block: 1836214
address: 0x58dd96aa829353032a21c95733ce484b949b2849 block: 1836217
```

## Start server

```
POLL=true node index.js
```

## Q&A

Q: How to make a 0-ETH transactions with geth?

```
geth console
> personal.listAccounts
["your_address", ...]
> personal.unlockAccount('your_address')
> eth.sendTransaction({from: 'your_address', to: 'yes_or_no_address', value: 0})
```
