import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

const privateKey = new Keypair(); // generate new private key
const programId = 'your program ID';
const tokenAmount = '1000';
const destinationAddress = 'destination wallet address';

const connection = new Connection('https://testnet.solana.com');
const App = () => {
  const versionedTransaction = VersionedTransaction({
    programId: programId,
    keys: [
      { pubkey: privateKey.publicKey, isSigner: true, isWritable: true },
      { pubkey: destinationAddress, isSigner: false, isWritable: true },
    ],
    data: new Uint8Array([tokenAmount]),
  });

  connection.sendVersionedTransaction(versionedTransaction, privateKey)
    .then(console.log)
    .catch(console.error);
}
export default App;