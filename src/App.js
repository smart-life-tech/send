import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';

const privateKey = "NjVUE3kYPtZUVWjsVdWQVDtBE7qcfFKusV6THjvYx1TELELqeMGP3FH1mT6wAki6";//new Keypair(); // generate new private key
const programId = '9AP4YxXECyAkqVgaxR9itdo4azmNWiGUJwUxhD6PPztn';
const tokenAmount = '10';
const destinationAddress = 'AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT';

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