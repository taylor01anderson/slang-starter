import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      const provider = await detectEthereumProvider();

      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount('');
    setIsConnected(false);
  };

  useEffect(() => {
    const checkConnection = async () => {
      const provider = await detectEthereumProvider();
      if (provider && window.ethereum.selectedAddress) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        setAccount(window.ethereum.selectedAddress);
        setIsConnected(true);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      });
    }
  }, []);

  const value = {
    web3,
    account,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
