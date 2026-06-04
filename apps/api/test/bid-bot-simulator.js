"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const API_URL = process.env.API_URL || 'http://localhost:4000';
const WS_URL = process.env.WS_URL || 'http://localhost:4000/auction';
const NUM_BOTS = 20;
const AUCTION_ID = process.argv.find(arg => arg.startsWith('--auctionId='))?.split('=')[1];
const MODE = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'war';
const SEED_FILE = process.argv.find(arg => arg.startsWith('--useSeedFile='))?.split('=')[1];
let vendorList = [];
if (SEED_FILE && fs.existsSync(SEED_FILE)) {
    vendorList = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    console.log(`📂 Loaded ${vendorList.length} vendors from seed file.`);
}
let currentHighestPrice = 0;
let tickSize = 1000;
const errorCountsByPrice = {};
const botLastBidPrices = [];
let currentTargetPrice = 0;
let lastTriggeredPrice = 0;
const bots = [];
function triggerNextRaceRound() {
    const nextPrice = Math.max(currentHighestPrice, currentTargetPrice) + tickSize;
    currentTargetPrice = nextPrice;
    console.log(`\n🏁 NEXT RACE ROUND: Firing bids of amount ₹${nextPrice.toLocaleString()}...`);
    setTimeout(() => {
        bots.forEach((bot, i) => {
            const vendor = vendorList[i] || { id: `bot-vendor-${i}` };
            botLastBidPrices[i] = nextPrice;
            bot.emit('placeBid', {
                auctionId: AUCTION_ID,
                vendorId: vendor.id,
                amount: nextPrice,
                idempotencyKey: (0, uuid_1.v4)()
            });
        });
    }, 1500);
}
async function run() {
    console.log(`🚀 Starting Bot Simulator [Mode: ${MODE}] for Auction: ${AUCTION_ID}`);
    const numToSpawn = vendorList.length > 0 ? vendorList.length : NUM_BOTS;
    for (let i = 0; i < numToSpawn; i++) {
        const vendor = vendorList[i] || { id: `bot-vendor-${i}`, name: `Bot ${i}` };
        const socket = (0, socket_io_client_1.io)(WS_URL, {
            transports: ['websocket'],
        });
        socket.on('connect', () => {
            console.log(`Bot ${i} (${vendor.name}) connected`);
            socket.emit('joinAuction', { auctionId: AUCTION_ID });
        });
        socket.on('auctionState', (auction) => {
            if (auction.tickSize) {
                tickSize = auction.tickSize;
            }
            const highest = auction.bids?.[0]?.amount || auction.basePrice || 0;
            if (highest > currentHighestPrice) {
                currentHighestPrice = highest;
                if (i === 0) {
                    console.log(`ℹ️ Initialized price from auction state: ₹${currentHighestPrice.toLocaleString()} (Tick size: ₹${tickSize.toLocaleString()})`);
                }
            }
        });
        socket.on('bidError', (err) => {
            console.error(`Bot ${i} Error:`, err.message);
            if (MODE === 'race' && err.message === 'The price is already bid. Try the next highest bid.') {
                const failedPrice = botLastBidPrices[i];
                if (failedPrice) {
                    errorCountsByPrice[failedPrice] = (errorCountsByPrice[failedPrice] || 0) + 1;
                    if (errorCountsByPrice[failedPrice] >= 5 && lastTriggeredPrice < failedPrice) {
                        lastTriggeredPrice = failedPrice;
                        console.log(`⚠️ Received ${errorCountsByPrice[failedPrice]} error messages for ₹${failedPrice.toLocaleString()}. Triggering next bidding round...`);
                        triggerNextRaceRound();
                    }
                }
            }
        });
        socket.on('newBid', (data) => {
            const amount = data.bid.amount;
            if (amount > currentHighestPrice) {
                currentHighestPrice = amount;
            }
            if (i === 0) {
                console.log(`📢 Live Bid Update: ₹${amount.toLocaleString()} (Leader: ${data.bid.vendor?.name || data.bid.vendorId})`);
            }
        });
        bots.push(socket);
        await new Promise(r => setTimeout(r, 30));
    }
    console.log('⏳ Waiting for auction state initialization...');
    for (let attempt = 0; attempt < 50; attempt++) {
        if (currentHighestPrice > 0)
            break;
        await new Promise(r => setTimeout(r, 200));
    }
    if (currentHighestPrice === 0) {
        console.error('❌ Failed to initialize auction price state. Exiting.');
        process.exit(1);
    }
    console.log(`✅ Auction state initialized. Starting simulation at ₹${currentHighestPrice.toLocaleString()}...`);
    if (MODE === 'race') {
        console.log('🏁 RACE MODE: All bots firing same amount simultaneously...');
        const amount = currentHighestPrice + tickSize;
        currentTargetPrice = amount;
        console.log(`Firing initial bids of amount ₹${amount.toLocaleString()}...`);
        bots.forEach((bot, i) => {
            const vendor = vendorList[i] || { id: `bot-vendor-${i}` };
            botLastBidPrices[i] = amount;
            bot.emit('placeBid', {
                auctionId: AUCTION_ID,
                vendorId: vendor.id,
                amount: amount,
                idempotencyKey: (0, uuid_1.v4)()
            });
        });
    }
    else if (MODE === 'war') {
        console.log('⚔️ WAR MODE: Random staggered bidding...');
        setInterval(() => {
            const botIdx = Math.floor(Math.random() * bots.length);
            const vendor = vendorList[botIdx] || { id: `bot-vendor-${botIdx}` };
            const bidAmount = currentHighestPrice + tickSize;
            currentHighestPrice = bidAmount;
            bots[botIdx].emit('placeBid', {
                auctionId: AUCTION_ID,
                vendorId: vendor.id,
                amount: bidAmount,
                idempotencyKey: (0, uuid_1.v4)()
            });
        }, 1500);
    }
    process.on('SIGINT', () => {
        bots.forEach(b => b.disconnect());
        process.exit();
    });
}
run().catch(console.error);
//# sourceMappingURL=bid-bot-simulator.js.map