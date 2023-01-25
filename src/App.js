import './App.css';
import React,{useEffect, useState} from 'react'
import * as anchor from "@project-serum/anchor";
import {Buffer} from 'buffer';
import idl from './idl.json' //get the smartcontract data structure model from target folder in anchor rust
import { Connection, PublicKey, clusterApiUrl  } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils } from '@project-serum/anchor';
import { FeedPostDesign } from './feedPostDesign';
const {
  SolanaWeb3,
  Account,
  B64ToUint8Array,
} = require('@solana/web3.js');
const {SystemProgram,Keypair} = web3;

window.Buffer = Buffer
const programID = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"//new PublicKey(idl.metadata.address)
const network = clusterApiUrl("devnet")
const opts = {
  preflightCommitment:"processed",
}
const feedPostApp = Keypair.generate();
const connection = new Connection(network, opts.preflightCommitment);



const web3 = new SolanaWeb3();

// Replace with your private key
const privateKey = B64ToUint8Array(
  'YOUR_PRIVATE_KEY'
);

// Replace with the recipient's public key
const recipient = 'PUBLIC_KEY_OF_RECIPIENT';

// Replace with the amount of tokens to send
const amount = 100;
async function receiveTokens() {
  // Create a new account object
  const account = new Account(privateKey);

  // Get the current balance
  const balance = await web3.getBalance(account.publicKey);
  console.log(`Current balance: ${balance}`);

  // Wait for incoming transactions
  web3.onTransaction(async (transaction) => {
    if (transaction.programId === programId) {
      console.log(`Received ${transaction.amount} tokens`);
    }
  });
}


async function sendTokens() {
  // Create a new account object
  const account = new Account(privateKey);

  // Get the current balance
  const balance = await web3.getBalance(account.publicKey);
  console.log(`Current balance: ${balance}`);

  // Build and sign the transaction
  const transaction = await web3.buildSendTransaction({
    recipient,
    amount,
    programId,
  }, account);
  const { signedTransaction } = await web3.signTransaction(transaction, privateKey);

  // Send the transaction
  const result = await web3.sendTransaction(signedTransaction);
  console.log(`Transaction sent: ${result.transactionId}`);
}



const App = () => {
  const [Loading, setLoading] = useState(false)
  const [datas,setData] = useState([])
  const [walletaddress, setWalletAddress] = useState("");
  
  const { solana } = window;
  const getProvider = () => {
    //Creating a provider, the provider is authenication connection to solana
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      setLoading(true)
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect({
            onlyIfTrusted: true, //second time if anyone connected it won't show anypop on screen
          });
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found!, Get a Phantom Wallet");
      }
    } catch (error) {
      console.log(error.message);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    try{
      setLoading(true)
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }catch(err){
      console.log(err.message)
    }finally{
      setLoading(false)
    }
  }, []);

  const onLoad = async() => {
    await checkIfWalletIsConnected();
    await getPosts();
  };

  const connectWalletRenderPopup = async () => { //first time users are connecting to wallet this function will activate
    try{
      setLoading(true)
      if (solana) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
      }
    }catch(err){
      console.log(err.message)
    }finally{
      setLoading(false)
    }
  };

  const connect = () => {
    return (
      <button onClick={connectWalletRenderPopup} className="buttonStyle"> {Loading ? <p>loading...</p>: <p>Connect Your Wallet To Post </p>}    </button>
    );
  };

  const createPostFunction = async(text,hastag,position) =>{ //createPostFunction connects to the smartcontract via rpc and lib.json  to create post
    const provider = getProvider() //checks & verify the dapp it can able to connect solana network
    const program = new Program(idl,programID,provider) //program will communicate to solana network via rpc using lib.json as model
    const num = new anchor.BN(position); //to pass number into the smartcontract need to convert into binary
    try{
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      setLoading(true)
      const tx = await program.rpc.createPost(text,hastag,num,false,{ 
        accounts:{
          feedPostApp:feedPostApp.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers:[feedPostApp] 
      })
      //const account_data  = await program.account.feedPostApp.fetch(feedPostApp.publicKey)
      //console.log('user_data',user_data,'tx',tx,'feedpostapp',feedPostApp.publicKey.toString(),'user',provider.wallet.publicKey.toString(),'systemProgram',SystemProgram.programId.toString())
      onLoad();
      sendTokens();
      receiveTokens();
    }catch(err){
      console.log(err.message)
    }finally{
      setLoading(false)
    }
  }

  const getPosts = async() =>{
    const provider = getProvider();
    const program = new Program(idl,programID,provider)
    try{
      setLoading(true)
      await Promise.all(
        ((await connection.getProgramAccounts(programID)).map(async(tx,index)=>( //no need to write smartcontract to get the data, just pulling all transaction respective programID and showing to user
          {
          ...(await program.account.feedPostApp.fetch(tx.pubkey)),
            pubkey:tx.pubkey.toString(),
        }
        )))
    ).then(result=>{
      result.sort(function(a,b){return b.position.words[0] - a.position.words[0] })
      setData([...result])
    })
    }catch(err){
      console.log(err.message)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className='App'>
      <FeedPostDesign posts={datas} createPostFunction={createPostFunction}  walletaddress={walletaddress} connect={connect} Loading={Loading} />
    </div>
  );
};

export default App;
