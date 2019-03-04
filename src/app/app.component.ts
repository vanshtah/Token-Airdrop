import { Component, HostListener, ChangeDetectorRef } from '@angular/core';
const Web3 = require('web3');
import * as XLSX from 'xlsx';
type AOA = any[][];

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./style.css']
})
export class AppComponent {

  // xls 
  data;

  token_address;
  tokenName;
  tokenSymbol;
  decimals;

  distAddresses = [];
  distAmount = [];

  invalidAddresses = [];

  // TODO add proper types these variables
  account: any;
  accounts: any;
  web3: any;
  contract;
  contractAddress = "0x923fc7f3b27714540e65cdf57a23a0723ac3e886"; // ROPSTEN
  contractAbi = [ { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_tokenAddr", "type": "address" }, { "name": "dests", "type": "address[]" }, { "name": "values", "type": "uint256[]" } ], "name": "multisend", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" } ];
  tokenAbi = [ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256" } ], "payable": false, "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "inputs": [ { "name": "_initialAmount", "type": "uint256" }, { "name": "_tokenName", "type": "string" }, { "name": "_decimalUnits", "type": "uint8" }, { "name": "_tokenSymbol", "type": "string" } ], "payable": false, "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_extraData", "type": "bytes" } ], "name": "approveAndCall", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "version", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "type": "function" } ];
  tokenContract;

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  @HostListener('window:load')
  windowLoaded() {
    this.checkAndInstantiateWeb3();
    this.onReady();
  }

  checkAndInstantiateWeb3 = () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.log(
        'Using web3 detected from external source.'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
      console.log(this.web3);
      this.contract = this.web3.eth.contract(this.contractAbi).at(this.contractAddress);
      console.log(this.contract);
      this.web3.version.getNetwork((err, netId) => {
        switch (netId) {
          case "1":
            console.log('This is mainnet')
            break
          /*case "3":
            alert('Alert: This is a Test Network. ATE/ETH amount displayed here doesn\'t hold any real value! Kindly select Main Etherum Network in MetaMask to buy Tokens.' );
            break */
          default:
            // alert('Error: Please choose Main Ethereum Network in your Metamask.');
        }
      });

    } else {
      alert('No web3 detected. Kindly check your MetaMask settings.');
    }
  
  };

  onReady = () => {

    window.ethereum.enable()
    .then(accs=> {

      if (accs.length === 0) {
        alert('Your metamask account is locked. Plese unlock account make transactions.');
      }
      
      this.account = accs[0];
      console.log(this.account);      
    })
    .catch( err => {
      alert(err);
    });
  };

  fetchDetails = () => {
    this.tokenContract = this.web3.eth.contract(this.tokenAbi).at(this.token_address);

    var namePromise = new Promise ((resolve,reject) => {
      this.tokenContract.name.call(function(err,name) {
        if(err) {
          reject();
        } else {
          resolve(name);
        }
      });
    });

    var symbolPromise = new Promise ((resolve,reject) => {
      this.tokenContract.symbol.call(function(err,symbol) {
        if(err) {
          reject();
        } else {
          resolve(symbol);
        }
      });
    });

    var decimalPromise = new Promise ((resolve,reject) => {
      this.tokenContract.decimals.call(function(err,decimals) {
        if(err) {
          reject();
        } else {
          resolve(decimals.toNumber());
        }
      });
    });

    Promise.all([namePromise,symbolPromise,decimalPromise]).then(tokenInfo => {
      this.tokenName = tokenInfo[0];
      this.tokenSymbol = tokenInfo[1];
      this.decimals = tokenInfo[2];
      console.log(tokenInfo);
    }).catch(err => {
      alert(err);
    });
    
  }

  onFileChange(evt: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(evt.target);
		if (target.files.length !== 1) throw new Error('Cannot use multiple files');
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			/* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
      this.data = <AOA>(XLSX.utils.sheet_to_json(ws, {header: 1}));
      console.log(this.data);

      this.distAddresses = [];
      this.distAmount = [];
      this.invalidAddresses = [];
      
      for(var i = 0; i < this.data.length; i++) {

        // remove whitespaces
        let address = this.data[i][0].replace(/\s/g,'');
        // let amount = this.data[i][1] * 10 ** this.decimals;
    
        let amount = this.web3.toBigNumber(this.data[i][1]).times(Math.pow(10, this.decimals)).toFixed();
        // only if valid address
        if(this.web3.isAddress(address)) {
          this.distAddresses.push(address);
          this.distAmount.push(amount);
        } 
        else {
          this.invalidAddresses.push(address);
        }  

        this.data[i][1] = amount;
      }

      console.log(this.distAddresses);
      console.log(this.distAmount);
		};
		reader.readAsBinaryString(target.files[0]);
	}

  airdrop() {
    this.contract.multisend(this.token_address, this.distAddresses, this.distAmount, {from: this.account, gasPrice: 30 * 10 **9}, (err, tx) =>{
      if(err) {
        alert('Error: '+ err);
      }
      else {
        alert('Tx hash: '+ tx);
      }
    })
  }
}
