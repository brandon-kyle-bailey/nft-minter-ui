import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import nftAbiArtifact from './utils/nft.json';
import {ethers} from 'ethers';

// Constants
const TWITTER_HANDLE = 'brandonkpbailey';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 10;

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [currentSupply, setCurrentSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    if(!ethereum) {
      alert("Make sure you have metamask setup!");
      return;
    }
    console.log(ethereum);
    const accounts = await ethereum.request({method: "eth_accounts"});

    if(accounts.length > 0) {
      setCurrentAccount(accounts[0]);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if(!ethereum) {
        alert("Make sure you have metamask setup!");
        return;
      }
      console.log(ethereum);
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
      }
  }

  const askContractToMintNft = async () => {
    const CONTRACT_ADDRESS = "0xa8bCADd4A521D820E881031E1AbD96EDc5C643B9";
    try {
      const {ethereum} = window;
      if (ethereum) {
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4"; 
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
          return;
        }
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, nftAbiArtifact.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`)
        });

        let txn = await connectedContract.mint();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${txn.hash}`);
        await txn.wait();

        let maxSupply = await connectedContract.viewMaxSupply();
        let currentSupply = await connectedContract.viewCurrentSupply();
        console.log(`max supply: ${maxSupply.toString()}`);
        console.log(`current supply: ${currentSupply.toString()}`);
        setCurrentSupply(parseInt(currentSupply.toString()));
        setMaxSupply(parseInt(maxSupply.toString()));
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">
            Current supply {currentSupply}/{maxSupply}
          </p>
          {currentAccount === "" ? 
            (renderNotConnectedContainer()
            ) : (
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
                </button>)}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;