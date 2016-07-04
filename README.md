# CarbonVote

## Requirements
* node
* redis

```
var voteContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"}]);
var vote = voteContract.new(
   {
     from: web3.eth.accounts[0],
     data: '60606040525b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b6101268061003f6000396000f36060604052361561003d576000357c01000000000000000000000000000000000000000000000000000000009004806341c0e1b5146100835761003d565b6100815b600034111561007e573273ffffffffffffffffffffffffffffffffffffffff16600034604051809050600060405180830381858888f19350505050505b5b565b005b6100906004805050610092565b005b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561012357600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b5b56',
     gas: 4700000
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })

Contract mined! address: 0xb891546333c9320f73e7ae5c17d19a6a3ae9d872 transactionHash: 0xfee579bcb4347d5972f98395507ffe2074c91dea9ae26a48f4ebd3abe706af22

Contract mined! address: 0x8f25312592fe541f303b3e9fb3ae5d4985f0bf49 transactionHash: 0x559909e0b8d80d1e116b84622cca75f6ed808ada5bde9540cf29350c49fed45f
```
