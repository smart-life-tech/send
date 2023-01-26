//import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import React, { useState } from 'react';
import { Connection,Account,Transaction} from '@solana/web3.js';
//import { Solana } from 'solana-web3.js';
const privateKey = "NjVUE3kYPtZUVWjsVdWQVDtBE7qcfFKusV6THjvYx1TELELqeMGP3FH1mT6wAki6";//new Keypair(); // generate new private key
const programId = '9AP4YxXECyAkqVgaxR9itdo4azmNWiGUJwUxhD6PPztn';
const tokenAmount = '10';
const destinationAddress = 'AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT';

const connection = new Connection('https://testnet.solana.com');


function SendReceiveSolana() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [privateKey, setPrivateKey] = useState('');

  // Send Solana tokens
  const handleSend = async () => {
    const sender = new Account(privateKey);
    const transaction = new Transaction().transfer(address, amount);
    transaction.addSigner(sender);
    const signature = await connection.sendTransaction(transaction);
    console.log(`Transaction signature: ${signature.toString()}`);
  };

  // Receive Solana tokens
  const handleReceive = async () => {
    const balance = await connection.getBalance(address);
    setBalance(balance);
  };

  return (
    <div>
      <h1>Send and Receive Solana Tokens</h1>
      <form>
        <label>
          Address:
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} />
        </label>
        <br />
        <label>
          Amount:
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        </label>
        <br />
        <label>
          Private Key:
          <input type="text" value={privateKey} onChange={e => setPrivateKey(e.target.value)} />
        </label>
      </form>
      <br />
      <button onClick={handleSend}>Send</button>
      <button onClick={handleReceive}>Receive</button>
      <br />
      <h2>Balance: {balance} SOL</h2>
    </div>
  );
}

export default SendReceiveSolana;

