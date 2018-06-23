/*
FIRST: copy and run the following npm install lines into your console to install all all required modules (if not allready installed)

npm install web3
npm install solc
npm install request-promise-native
npm install log4js
npm install nconf


SECOND: after 'npm install' you must apply the following patch to node_modules/web3-eth-accounts/src/index.js
179,182c179,182
                 transaction.data,
                 Bytes.fromNat(transaction.chainId || "0x1"),
                 "0x",
                 "0x"]);
-
                 transaction.data]);
                 //Bytes.fromNat(transaction.chainId || "0x1"),
                 //"0x",
                 //"0x"]);

187c187,188
             var signature = Account.makeSigner(Nat.toNumber(transaction.chainId || "0x1") * 2 + 35)(Hash.keccak256(rlpEncoded), privateKey);
-
             //var signature = Account.makeSigner(Nat.toNumber(transaction.chainId || "0x1") * 2 + 35)(Hash.keccak256(rlpEncoded), privateKey);
             var signature = Account.makeSigner(27)(Hash.keccak256(rlpEncoded), privateKey);

*/

// ******************************************************************************
// configurable variables
 
const TARGET_ACCOUNT_BALANCE = 40000000000000000
const FAUCET_INTERVAL = 60000  // to prevent faucet error (too many requests in given amount of time)
const WAIT_BETWEEN_CALLS = 5000  // to ensure increment request was executed before calling new counter value

// to work with and switch between different accounts and contracts 
// config is stored in ./config_[CONFIGURATION].json
const CONFIGURATION = 'test2'  

// console output is also logged with timestamps in ./config_[CONFIGURATION].log
// possible levels are: fatal < errror < warn < info < debug
const LOGGER_LEVEL = 'debug';   

const providerUrl = 'https://kevm-testnet.iohkdev.io:8546'
//const providerUrl = 'http://localhost:3000'

// ******************************************************************************

const Web3 = require('web3')
const request = require('request-promise-native')


var log4js = require('log4js');
log4js.configure({
  appenders: {
    out: { type: 'stdout', layout: { type: 'pattern', pattern: '%[%p %m%]' } },
    log: { type: 'file', filename: 'config_'+CONFIGURATION+'.log', layout: { type: 'pattern', pattern: '%d %r %p %m' } }
  },
  categories: {
    default: { appenders: [ 'out', 'log' ], level: 'debug' }
  }
});
var logger = log4js.getLogger();
logger.level = LOGGER_LEVEL;

var PRIVATEKEY;
var CONTRACTADDRESS;

process.on('unhandledRejection', err => {
  logger.error(err);
});

// ******************************
// Step 1 - look for existing privateKey and contractAddress in local config file
// ******************************

var nconf = require('nconf');
nconf.use('file', { file: './config_'+CONFIGURATION+'.json' });
nconf.load();
if (nconf.get('privateKey') != undefined ) {
	PRIVATEKEY = nconf.get('privateKey');
    logger.info('Existing personal wallet privateKey found in config_'+CONFIGURATION+'.json');
} else {
    logger.warn('No personal wallet privateKey found in config_'+CONFIGURATION+'.json');
}
if (nconf.get('contractAddress') != undefined ) {
	CONTRACTADDRESS = nconf.get('contractAddress');
    logger.info('Existing deployed contractAddress found in config_'+CONFIGURATION+'.json');
} else {
    logger.warn('No deployed contractAddress found in config_'+CONFIGURATION+'.json');
}

  
const run = async () => {
  const web3 = new Web3(providerUrl)

  // ******************************
  // Step 2 - try using the account, and if it fails create a new one
  // To create an account, you need a random generated private key. 
  // This portion of the script will try create a new random key string
  // The privateKey is stored in local config file for further operations
  // ******************************

  try {
    var account = web3.eth.accounts.privateKeyToAccount(PRIVATEKEY)
  } catch (err) {
    const rand = crypto.randomBytes(32).toString('hex');
	account = web3.eth.accounts.privateKeyToAccount("0x" + rand + "");
	nconf.set('privateKey', '0x'+rand+'');
	nconf.save(function (err) {
		if (err) {
			console.error(err.message);
			return;
		} else {
			logger.debug('was generated and stored in ./config_'+CONFIGURATION+'.json for future operations');
		}
	  });
  } 
  var res = web3.eth.accounts.wallet.add(account);

  // ******************************
  // Step 3 - fund the account
  // If the account balance is zero, here we request test tokens from the IOHK faucet
  // and wait until the account is funded.
  // ******************************

  logger.info('Account = ' + account.address)
  let balance = parseInt(await web3.eth.getBalance(account.address), 10)
  logger.info('Account balance = ' + balance)
  if (balance <= TARGET_ACCOUNT_BALANCE) {
	  logger.debug('##########################################################################')
	  logger.debug('#                                                                        #')
	  logger.debug('#  while your new account will be credited with test tokens (takes 5min) #')
	  logger.debug('#  please have a look at https://forum.cardano.org/c/developers          #')
	  logger.debug('#  to learn new things and pass on your knowledge to others.             #')
	  logger.debug('#                                                                        #')
	  logger.debug('##########################################################################')
  }
  
  while (balance <= TARGET_ACCOUNT_BALANCE) {
    await new Promise(async (res,rej) => {
      logger.info('Requesting more test tokens from faucet (waiting ' + FAUCET_INTERVAL / 1000 + ' seconds)')
      const url = "https://kevm-testnet.iohkdev.io:8099/faucet?address=" + account.address
      try {
        await request.post(url)
      } catch (err) {
        logger.error(err.message)
        process.exit()
      }
      var funded = false
      const interval = setInterval(async () => {
        const newbalance = parseInt(await web3.eth.getBalance(account.address), 10)
        if (newbalance > balance) {
          res()
          clearInterval(interval)
        }
      }, FAUCET_INTERVAL)
    })
    balance = parseInt(await web3.eth.getBalance(account.address), 10)
    logger.info('Account balance = ' + balance)
  }

  // ******************************
  // Step 4 - compile the contract
  // Use the solcjs package to obtain the abi and binary for the following Solidity source
  // ******************************
  const solc = require('solc')
  const contractSource = `

	// Test Solidity Contract
	pragma solidity ^0.4.0;

	contract Counter {
	  int private count = 0;
	  function incrementCounter() public {
		count += 1;
	  }
	  function decrementCounter() public {
		count -= 1;
	  }
	  function getCount() public constant returns (int) {
		return count;
	  }
	}

	`
  const output = solc.compile(contractSource, 1)
  const abi = output.contracts[':Counter'].interface
  const bin = output.contracts[':Counter'].bytecode
  //logger.info("abi=" + abi)
  //logger.info("bin=" + bin)
  if (CONTRACTADDRESS == undefined) {
  
    // ******************************
    // Step 5 - deploy the contract
    // ******************************
    const contract = new web3.eth.Contract(JSON.parse(abi))
    const myContract = await contract.deploy({
  	data: "0x" + bin
    }).send({
  	from: account.address,
  	gas: 5000000,
  	gasPrice: 5000000000
    })
    CONTRACTADDRESS = myContract.options.address;
    logger.info('New contract successfully compiled and deployed')
    // Store the deployed contract address in local config file
    nconf.set('contractAddress', CONTRACTADDRESS);
    nconf.save(function (err) {
  	if (err) {
  	  console.error(err.message);
  	  return;
  	}
  		logger.info('contract '+CONTRACTADDRESS)
  		logger.debug('was stored in config_'+CONFIGURATION+'.json for future operations')
    });
  
  } 

  // ******************************
  // Step 6 - test the deployed contract
  // ******************************

  logger.info('Now going to interact with contract ' + CONTRACTADDRESS)  
  const instance = new web3.eth.Contract(JSON.parse(abi), CONTRACTADDRESS)
  // Test setter and getter
  const beforeCount = await instance.methods.getCount().call()
  logger.info('Count before=' + beforeCount)
  await instance.methods.incrementCounter().send({
    from: account.address,
    gas: 100000,
    gasPrice: 5000000000
  })
  logger.info('waiting ' + WAIT_BETWEEN_CALLS / 1000 + ' seconds...')
  await sleep(WAIT_BETWEEN_CALLS);
  const afterCount = await instance.methods.getCount().call()
  logger.info('Count after=' + afterCount)
  }


try {
  run()
} catch (err) {
  logger.error(err)
}


// ***********************************************************************
// Functions

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
