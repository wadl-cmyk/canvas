import React, { useState, useCallback, useRef } from "react";
import produce from "immer";
import Web3 from 'web3';

import { useWallet, UseWalletProvider } from 'use-wallet';


const abijson = require('./abi.json')

const web3 = new Web3(Web3.givenProvider);

const contractAddr = '0x991927E02445E03D89FA2FF30A7433778a0B1D48';
const SimpleContract = new web3.eth.Contract(abijson, contractAddr);
// const account = accounts[0]
var firstAccount: any;

declare global {
  interface Window {
    ethereum: any
    web3: any
  }
}
// const initialize = async (e:any) => {
    
  // minted.length = 0
  // e.preventDefault();
  // const accounts = await window.ethereum.enable();
  // const account = accounts[0];
  // const result = await SimpleContract.methods.totalSupply().call();
  
  // for (let i = 0; i < result; i++) {
    // const mint = await SimpleContract.methods.tokenByIndex(i).call();
    // minted.push(mint);
  // }
  // // setGetSupply(minted);
  // minted = minted.map(Number);
  // console.log('initialized');
// }



export const Wallet = () => {
  const wallet = useWallet()
  const blockNumber = wallet.getBlockNumber()

  
  return (
    <>
      <h1>Wallet</h1>
      {wallet.status === 'connected' ? (
        
     
        <div>
          
        
          <div>Account: {wallet.account}</div>
          <div>Balance: {wallet.balance}</div>
          <div>Status: {wallet.status}</div>
          
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

var minted:number[] = [];

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
  
  const [getSupply, setGetSupply] = useState([]);
  
  const [getMinted, setGetMinted] = useState<number[]>([]);
  
  const updateNftGrid = (i:number, k:number) => {
    const newGrid = produce(grid, gridCopy => {
      gridCopy[i][k] = grid[i][k] ? 0 : 1;
      for (let n = 0; n < minted.length; n++) {
        const row_no = Math.floor(minted[n]/50);
        const col_no = minted[n] - row_no*50
        gridCopy[row_no][col_no] = 1
      }                  
    });
    
    setGrid(newGrid);
  }
  
  
  
  const handleSupply = async (e:any) => {
    
    minted.length = 0
    e.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const result = await SimpleContract.methods.totalSupply().call();
    
    for (let i = 0; i < result; i++) {
      const mint = await SimpleContract.methods.tokenByIndex(i).call();
      minted.push(mint);
    }
    // setGetSupply(minted);
    setGetMinted(minted);
    // minted = minted.map(Number);
    
    console.log(minted);
  }
  
  const handleGet = async (e:any) => {
    
    e.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const result = await SimpleContract.methods.tokensOfOwner(account).call();
    setGetNumber(result);
    tokenlist = result
    console.log(result);
    no_tokens = result.length;
  }
  
  const handleSet = async (e:any) => {
    e.preventDefault();    
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    // console.log(account);
    // const gas = await SimpleContract.methods.pauseDrop().estimateGas({gas: 5000000}, function(error: any, gasAmount: any){
      // if(gasAmount == 5000000)
        // console.log('Method ran out of gas');
    // });
    // console.log(gas);
    const result = await SimpleContract.methods.adoptPixel(newselection).send({
      value: 10000000000000000*newselection.length,
      from: account,
      gas: 250000*newselection.length
    })
  }
  
  const getOwnedPixels = async (e:any) => {
    
    e.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const result = await SimpleContract.methods.tokensOfOwner(account).call();
    setGetNumber(result);
    tokenlist = result
    console.log(result);
    no_tokens = result.length;
  }
  
  // const indexOfAll = (arr:any, val:any) => arr.reduce((acc:any, el:any, i:any) => (el === val ? [...acc, i] : acc), []);
  
  // console.log(indexOfAll(grid, 1));
  
  function findInArr(arr:any, elm:any) {
    var occ = [];
    for(var i = 0; i < arr.length; i++)
        for(var j = 0; j < arr[i].length; j++)
            if(arr[i][j] == elm)
                occ.push(j+i*50);
    return occ;
  }
  
  var selection = findInArr(grid, 1)
  var tokenlistint = getMinted.map(Number);
  console.log(selection)
  console.log(tokenlistint)
  // const word:string = "2"
  const newselection = selection.filter(val => !tokenlistint.includes(val));
  console.log(newselection)
  
  
  
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;
  
  // console.log(grid);

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
              onClick={() => {updateNftGrid(i, k)}}
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
        
      </UseWalletProvider>
      <button
        onClick={handleGet}
        type="button" > 
        Get owned pixels
      </button>
      
      { JSON.stringify(getNumber) }
      
      <button
        onClick={handleSet}
        type="button" > 
        Purchase pixels 
      </button>
      
      <button
        onClick={handleSupply}
        type="button" > 
        Get supply 
      </button>
      
      { JSON.stringify(getMinted) }
      


    </>
  );
};

export default App;
