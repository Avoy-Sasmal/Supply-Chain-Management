import * as fs from 'fs';
import * as path from 'path';

// Read the compiled ABI
const abiPath = path.join(__dirname, '../artifacts/contracts/SupplyChain.sol/SupplyChain.json');
const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Write ABI to frontend
const frontendAbiPath = path.join(__dirname, '../../client/src/contract-abi.json');
fs.writeFileSync(frontendAbiPath, JSON.stringify(artifact.abi, null, 2));

console.log('✅ ABI copied to client/src/contract-abi.json');
console.log('You can now import it in your frontend:');
console.log('import CONTRACT_ABI from "./contract-abi.json";');

