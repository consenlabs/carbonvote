# CarbonVote

## Requirements
* node
* redis

```
var voteContract = web3.eth.contract([{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"}],"name":"LogVote","type":"event"}]);

var vote = voteContract.new(
   {
     from: web3.eth.accounts[0],
     data: '6060604052609e8060106000396000f360606040523615600d57600d565b609c5b7fd66fd10d93c3fcf37a27c11c0e12214976632505c7954b53c023093d843fc1c433604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a160003411156099573373ffffffffffffffffffffffffffffffffffffffff16600034604051809050600060405180830381858888f19350505050505b5b565b00',
     gas: 4700000
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })

var vote = voteContract.new(
   {
     from: web3.eth.accounts[0],
     data: '6060604052609e8060106000396000f360606040523615600d57600d565b609c5b7fd66fd10d93c3fcf37a27c11c0e12214976632505c7954b53c023093d843fc1c433604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a160003411156099573373ffffffffffffffffffffffffffffffffffffffff16600034604051809050600060405180830381858888f19350505050505b5b565b00',
     gas: 4700000
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })


voteContract.LogVote({fromBlock: 1258370}).get()

```

Testnet:

```
address: 0xad04c71dbab273a3023972272f233d622673fea2 block: 1259912
address: 0x71bd4b74d86297768bf10c6dfe848ed405181ce5 block: 1259913
```

Production

```
address: 0x587d6669a2743a1d6094f150006f56f85b5aade3
address: 0x36ba156f8fba7bd116f78461d9fdf265b4e75747
```
