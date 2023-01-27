import React, { useState } from 'react';
import { Connection } from '@solana/web3.js';
import WalletConnect from '@walletconnect/browser';
const { struct, u32, ns64 } = require("@solana/buffer-layout");
const { Buffer } = require("buffer");
const web3 = require("@solana/web3.js");
let keypair = web3.Keypair.generate();
let payer = web3.Keypair.generate();

function StakeForm() {
  const [amount, setAmount] = useState(0);
  const [stakeError, setStakeError] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const solana = new Connection('https://testnet.solana.com');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      // Connect to Solana
      //await solana.connect();
      let connection = new web3.Connection(web3.clusterApiUrl("testnet"));
      await web3.sendAndConfirmTransaction(connection, allocateTransaction, [
        payer,
        keypair,
      ]);
      // Connect to WalletConnect
      const walletConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
      });
      await walletConnector.createSession();
      setWalletConnected(true);
      // Get the account that will be staking the tokens
      const account = await solana.wallet.getAccount();
      // Stake the tokens
      const transaction = await solana.stake.stake(account.publicKey, amount);
      await walletConnector.approveTransaction({
        ...transaction,
        callback: (error, approve) => {
          if (error) {
            setStakeError(error.message);
          } else if (approve) {
            setStakeError(null);
          }
        },
      });
    } catch (error) {
      // Update the UI to show that there was an error staking the tokens
      setStakeError(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Amount to stake:
        <input
          type="number"
          value={amount}
          onChange={event => setAmount(event.target.value)}
        />
      </label>
      <button type="submit">Stake</button>
      {stakeError && <p>Error: {stakeError}</p>}
    </form>
  );
}

export default StakeForm;
