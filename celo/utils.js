import Web3 from 'web3';
import requestFactoryABI from '../celo/build/factoryRequest.abi.json';
import requestABI from '../celo/build/request.abi.json';
import erc20Abi from '../celo/build/erc20.abi.json';
import { newKitFromWeb3 } from '@celo/contractkit';

const ERC20_DECIMALS = 18;
const cUSDContractAddress = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
const FactoryAddress = '0x76272abDB74DF54D2B65a46363BB810d28C3364E';

let kit;

const setKit = async () => {
  if (window.celo) {
    const web3 = new Web3(window.celo);
    kit = newKitFromWeb3(web3);
    const accounts = await kit.web3.eth.getAccounts();
    kit.defaultAccount = accounts[0];
  }
};

export const contribute = async (contract, message, price) => {
  await setKit();
  const result = await contract.methods
    .contribute(price, message)
    .send({ from: kit.defaultAccount });
};

export const connectWallet = async () => {
  if (window.celo) {
    if (!isConnected()) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);
        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0];
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log('Already Connected');
    }
  } else {
    console.log('window.celo not defined');
  }
};

export const createFactoryInstance = async () => {
  await setKit();
  const requestFactory = new kit.web3.eth.Contract(
    requestFactoryABI,
    FactoryAddress
  );
  return requestFactory;
};

export const approve = async (price, address) => {
  await setKit();
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress);

  const result = await cUSDContract.methods
    .approve(address, price)
    .send({ from: kit.defaultAccount });

  return result;
};

export const createRequestsInstances = async (requestsAddress) => {
  await setKit();
  let requests;
  if (requestsAddress) {
    requests = Array(requestsAddress.length)
      .fill()
      .map((element, index) => {
        return new kit.web3.eth.Contract(requestABI, requestsAddress[index]);
      });
  }

  return requests;
};

export const fetchAllRequests = async () => {
  await setKit();
  const factory = await createFactoryInstance();
  const requests = await factory.methods.getDeployedRequest().call();
  return requests;
};

export const getBalance = async () => {
  await setKit();
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  return cUSDBalance;
};

export const isConnected = () => {
  let state = false;
  if (window.celo) {
    if (window.celo._state.accounts) {
      state = false;
      if (window.celo._state.accounts.length !== 0) {
        state = true;
      }
    }
  }
  return state;
};

export const getAccounts = async () => {
  await setKit();
  const accounts = await kit.web3.eth.getAccounts();
  return accounts;
};

export const getBalanceOf = async (address) => {
  await setKit();
  const totalBalance = await kit.getTotalBalance(address);
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  return cUSDBalance;
};
