# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```


# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
//Test
npx hardhat test

//Compile after a change
npx hardhat compile

//Start node
npx hardhat node

//Make sure that ./ignition/parameters.json has the correct params

//Deploy
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost --parameters ./ignition/parameters.json

//Copy ./artifacts/contracts/Lock.sol/Lock.json abi list to client/src/utils/Lock_ABI.json

//Copy deployed address to client/src/utils/constants.js
```