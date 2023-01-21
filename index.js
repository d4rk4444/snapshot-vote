import snapshot from '@snapshot-labs/snapshot.js';
import ethers from 'ethers';
import Web3 from 'web3';
import fs from 'fs';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
dotenv.config();

const rpc = {
    Ethereum: 'https://rpc.ankr.com/eth	',
    BSC: 'https://bsc-dataseed.binance.org',
    Polygon: 'https://rpc-mainnet.matic.quiknode.pro',
    Avalanche: 'https://rpc.ankr.com/avalanche',
    Arbitrum: 'https://arb1.arbitrum.io/rpc',
    Optimism: 'https://mainnet.optimism.io',
    Fantom: 'https://rpc3.fantom.network',
    Moonbeam: 'https://rpc.ankr.com/moonbeam',
};
const parseFile = (file) => {
    const data = fs.readFileSync(file, "utf-8");
    const array = (data.replace(/[^a-zA-Z0-9\n]/g,'')).split('\n');
    return array;
};
const timeout = ms => new Promise(res => setTimeout(res, ms));
const generateRandomAmount = (min, max, num) => {
    const amount = Number(Math.random() * (max - min) + min);
    return Number(parseFloat(amount).toFixed(num));
};

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);
const ether = new ethers.providers.JsonRpcProvider(rpc[process.env.CHAIN]);

const privateKey = parseFile('private.txt');
const proporsal = process.env.LINK_PROPORSAL.split('/');

for (let i = 0; i < privateKey.length; i++) {
    const ethWallet = new ethers.Wallet(privateKey[i], ether);
    const address = await ethWallet.getAddress();
    console.log(`Wallet ${i+1}: ${address}`);

    await client.vote(ethWallet, address, {
        space: proporsal[4],
        proposal: proporsal[6],
        type: 'single-choice',
        choice: isNaN(Number(process.env.CHOICE)) ? generateRandomAmount(1, 2, 0) : Number(process.env.CHOICE),
    })
    .then(res => { console.log(chalk.green(`Vote ID ${i+1}: ${res.id}`)) })
    .catch(err => { console.log(chalk.bgBlack(chalk.red(`Error VOTE: ${JSON.stringify(err)}`))) });

    await client.follow(ethWallet, address, {
        space: proporsal[4]
    })
    .then(res => { console.log(chalk.green(`Follow ID ${i+1}: ${res.id}`)) } )
    .catch(err => { console.log(chalk.bgBlack(chalk.red(`Error FOLLOW: ${JSON.stringify(err)}`))) });
    
    await timeout(generateRandomAmount(2400, 5600, 0));
}
console.log(chalk.yellow('Process END!'));