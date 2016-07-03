# CarbonVote

## Requirements
* node
* redis

```
contract Vote {
    address creator;

    function Vote() {
        creator = msg.sender;
    }

    function kill() {
        if (msg.sender == creator) {
            suicide(creator);
        }
    }
}

var voteContract = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"}]);

var vote = voteContract.new({
  from: web3.eth.accounts[0],
  data: '60606040525b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b60d78061003e6000396000f360606040526000357c01000000000000000000000000000000000000000000000000000000009004806341c0e1b5146037576035565b005b604260048050506044565b005b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141560d457600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b5b56',
  gas: 4700000
}, function (e, contract) {
  console.log(e, contract);
  if (typeof contract.address !== 'undefined') {
    console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
  }
})

Contract mined! address: 0xf4d340fc0dbde35d7f9b2cce602f72a858d301ba transactionHash: 0x41f528153d4b94d216cb44e5cf28bbcc99b922203e3b830f0fa22ad7f5f2ba36
Contract mined! address: 0x32432012cff6a1dbb56241c51081c96a0cf26325 transactionHash: 0x2ba45e6c55cabe84672bf55286917ac869500c5697e84e6edcdd8e5e477cd10c
```
