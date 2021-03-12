import React, { useState, useCallback, useRef } from "react";
import produce from "immer";
import Web3 from 'web3';
// import { Web3ReactProvider } from '@web3-react/core'
// import { Web3Provider } from '@ethersproject/providers'
// import { useWeb3React } from '@web3-react/core'
// import { InjectedConnector } from '@web3-react/injected-connector'
import { useWallet, UseWalletProvider } from 'use-wallet';
//import { nftabi } from './abi';
// import fs from 'fs';
// const nftabi = require('./abi');

// const nftabi = fs.readFileSync('./abi.json');
// const nftjson = JSON.parse(nftabi.toString());

const abijson = require('./abijson.json')
const abi = abijson;

const web3 = new Web3(Web3.givenProvider);

const contractAddr = '0x991927E02445E03D89FA2FF30A7433778a0B1D48';
const SimpleContract = new web3.eth.Contract(abi, contractAddr);
// const account = accounts[0]
var firstAccount: any;


// function getAccount() {
    // const accounts: any = web3.eth.getAccounts().then(e => { firstAccount = e[0] })
// }
// getAccount()

// getAccounts(function(result) {
    // console.log(result[0]);
// });


// export const injectedConnector = new InjectedConnector({
  // supportedChainIds: [
    // 1, // Mainet
    // 3, // Ropsten
    // 4, // Rinkeby
    // 5, // Goerli
    // 42, // Kovan
  // ],
// })

// function getLibrary(provider: any): Web3Provider {
  // const library = new Web3Provider(provider)
  // library.pollingInterval = 12000
  // return library
// }

// export const Wallet = () => {
  // const { chainId, account, activate, active } = useWeb3React<Web3Provider>()

  // const onClick = () => {
    // activate(injectedConnector)
  // }

  // return (
    // <div>
      // <div>ChainId: {chainId}</div>
      // <div>Account: {account}</div>
      // {active ? (
        // <div>✅ </div>
      // ) : (
        // <button type="button" onClick={onClick}>
          // Connect
        // </button>
      // )}
    // </div>
  // )
// }



var currentaddress = '1';

export const Wallet = () => {
  const wallet = useWallet()
  const blockNumber = wallet.getBlockNumber()
  
  function getAccount() {
    currentaddress = wallet.account
    console.log('updated')
  }
  
  return (
    <>
      <h1>Wallet</h1>
      {wallet.status === 'connected' ? (
        
        
        <div>
          
          <div>Account: {wallet.account}</div>
          <div>Balance: {wallet.balance}</div>
          <div>Status: {wallet.status}</div>
          <button onClick={() => getAccount()}>update acc</button>
          <button onClick={() => wallet.reset()}>disconnect</button>
          
        </div>
      ) : (
        <div>
          Connect:
          <button onClick={() => wallet.connect('injected')}>MetaMask</button>
          
        </div>
      )}
    </>
    
  )
}

const numRows = 50;
const numCols = 50;
var no_tokens = 0;
var tokenlist:number[] = [] 

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }

  return rows;
};

const App: React.FC = () => {
  
  
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });
  
  const [getNumber, setGetNumber] = useState([]);
  
  const handleGet = async (e:any) => {
    
    e.preventDefault();
    const result = await SimpleContract.methods.tokensOfOwner(currentaddress).call();
    setGetNumber(result);
    tokenlist = result
    console.log(result);
    console.log(currentaddress);
    no_tokens = result.length;
  }

  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid(g => {
      return produce(g, gridCopy => {
        for (let i = 0; i < numRows; i++) {
          for (let k = 0; k < numCols; k++) {
            let neighbors = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                neighbors += g[newI][newK];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, 100);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation();
          }
        }}
      >
        {running ? "stop" : "start"}
      </button>
      <button
        onClick={() => {
          const rows = [];
          for (let i = 0; i < numRows; i++) {
            rows.push(
              Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
            );
          }

          setGrid(rows);
        }}
      >
        random
      </button>
      <button
        onClick={() => {
          setGrid(generateEmptyGrid());
        }}
      >
        clear
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <div
              key={`${i}-${k}`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][k] = grid[i][k] ? 0 : 1;
                  for (let n = 0; n < no_tokens; n++) {
                    const row_no = Math.floor(tokenlist[n]/50);
                    const col_no = tokenlist[n] - row_no*50
                    gridCopy[row_no][col_no] = 1
                  }                  
                });
                
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[i][k] ? "pink" : undefined,
                border: "solid 1px black"
              }}
            />
          ))
        )}
      </div>
      <UseWalletProvider
        chainId={42}
        connectors={{
          // This is how connectors get configured
          portis: { dAppId: 'my-dapp-id-123-xyz' },
        }}
      >
        <Wallet />
        <button
          onClick={handleGet}
          type="button" > 
          Get Number 
        </button>
      </UseWalletProvider>
      
      
      { JSON.stringify(getNumber) }

    </>
  );
};

      // <Web3ReactProvider getLibrary={getLibrary}>
        // <Wallet />
      // </Web3ReactProvider>

export default App;
