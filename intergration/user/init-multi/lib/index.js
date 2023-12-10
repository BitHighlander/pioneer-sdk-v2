"use strict";
/*
    E2E testing

 */
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require('dotenv').config({ path: "../../.env" });
require('dotenv').config({ path: "./../../.env" });
require("dotenv").config({ path: '../../../.env' });
require("dotenv").config({ path: '../../../../.env' });
const TAG = " | intergration-test | ";
const types_1 = require("@coinmasters/types");
console.log(process.env['BLOCKCHAIR_API_KEY']);
if (!process.env['VITE_BLOCKCHAIR_API_KEY'])
    throw Error("Failed to load env vars!");
if (!process.env['VITE_BLOCKCHAIR_API_KEY'])
    throw Error("Failed to load env vars!");
const log = require("@pioneer-platform/loggerdog")();
let assert = require('assert');
let SDK = require('@pioneer-sdk/sdk');
let wait = require('wait-promise');
let sleep = wait.sleep;
let BLOCKCHAIN = 'ethereum';
let ASSET = 'FOX';
let MIN_BALANCE = process.env['MIN_BALANCE_DOGE'] || "1.0004";
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.005";
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json';
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev';
console.log("spec: ", spec);
console.log("wss: ", wss);
let txid;
let IS_SIGNED;
const test_service = async function () {
    let tag = TAG + " | test_service | ";
    try {
        console.log(tag, ' CHECKPOINT 1');
        console.time('start2paired');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        //if force new user
        const queryKey = "sdk:pair-keepkey:" + Math.random();
        log.info(tag, "queryKey: ", queryKey);
        // const queryKey = "key:66fefdd6-7ea9-48cf-8e69-fc74afb9c45412"
        assert(queryKey);
        const username = "user:66fefdd6-7ea9-48cf-8e69-fc74afb9c45412" + Math.random();
        assert(username);
        //add custom path
        let paths = [];
        let config = {
            username,
            queryKey,
            spec,
            keepkeyApiKey: 'f095a295-a96f-4737-9e57-c86c613a013a',
            wss,
            paths,
            // @ts-ignore
            ethplorerApiKey: 
            // @ts-ignore
            process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
            // @ts-ignore
            covalentApiKey: 
            // @ts-ignore
            process.env.VITE__COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
            // @ts-ignore
            utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY,
            // @ts-ignore
            walletConnectProjectId: 
            // @ts-ignore
            process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
        };
        console.log(tag, ' CHECKPOINT 2');
        console.log(tag, ' config: ', config);
        let app = new SDK.SDK(spec, config);
        log.debug(tag, "app: ", app);
        console.log(tag, ' CHECKPOINT 3');
        const walletsVerbose = [];
        const { keepkeyWallet } = await Promise.resolve().then(() => __importStar(require("@coinmasters/wallet-keepkey")));
        log.info(tag, "walletKeepKey: ", keepkeyWallet);
        const walletKeepKey = {
            type: types_1.WalletOption.KEEPKEY,
            icon: "https://pioneers.dev/coins/keepkey.png",
            chains: types_1.availableChainsByWallet[types_1.WalletOption.KEEPKEY],
            wallet: keepkeyWallet,
            status: "offline",
            isConnected: false,
        };
        walletsVerbose.push(walletKeepKey);
        let resultInit = await app.init(walletsVerbose, {});
        log.info(tag, "resultInit: ", resultInit);
        log.info(tag, "wallets: ", app.wallets.length);
        //connect
        resultInit = await app.pairWallet('KEEPKEY', []);
        log.info(tag, "resultInit: ", resultInit);
        //
        await app.getPubkeys();
        await app.getBalances();
        log.info(tag, "pubkeys: ", app.pubkeys);
        log.info(tag, "balances: ", app.balances);
        // log.info(tag,"nfts: ",app.nfts)
        // log.debug(tag,"wallets: ",app.wallets)
        // log.info(tag,"pubkeys: ",app.pubkeys.length)
        // // log.info(tag,"balances: ",app.balances.length)
        // log.info(tag,"nfts: ",app.nfts.length)
        // log.info(tag,"context: ",app.context)
        // log.info(tag,"assetContext: ",app.assetContext)
        // log.info(tag,"blo: ",app.assetContext)
        // log.info(tag,"assetContext: ",app.assetContext)
        // //context should match first account
        let context = await app.context;
        log.info(tag, "context: ", context);
        assert(context);
        // assert(context,"metamask.wallet.json")
        //
        // //all the other accounts should be in wallets just offline
        // assert(app.wallet)
        // let allWallets = await app.wallets
        // log.info(tag,"allWallets: ",allWallets)
        // // assert(allWallets.length, metamask_accounts.length + 1) //plus keepkey
        //
        // log.info(tag,"user1 isFox: ",app.isFox)
        // log.info(tag,"user1 isPioneer: ",app.isPioneer)
        // log.info(tag,"user1 wallets: ",app.wallets)
        // log.info(tag,"user1 balances: ",app.balances)
        // log.info(tag,"user1 balances: ",app.balances.length)
        // log.info(tag,"user1 wallets: ",app.wallets.length)
        // //assert.strictEqual(user1.wallets.length, 2)
        // //assert.strictEqual(user1.walletDescriptions.length, 2)
        // for(let i = 0; i < app.pubkeys.length; i++){
        //     let pubkey = app.pubkeys[i]
        //     //log.info(tag,"pubkey: ",pubkey)
        //     assert(pubkey)
        //     assert(pubkey.context)
        // }
        //
        // for(let i = 0; i < app.balances.length; i++){
        //     let balance = app.balances[i]
        //     //log.info(tag,"balance: ",balance)
        //     assert(balance)
        //     assert(balance.symbol)
        //     assert(balance.context)
        //     assert(balance.assetCaip)
        //     assert(balance.blockchainCaip)
        // }
        //
        //
        //
        // // assert(user1)
        // //Should be Pioneer now
        // // assert(user1.isPioneer)
        //
        //
        //
        // //count pubkeys from software
        // // let pubkeysAll = app.pubkeys
        // // log.info(tag,"pubkeysAll: ",pubkeysAll.length)
        // // let pubkeysSoftware = pubkeysAll.filter((e:any) => e.context === "0xC3aFFff54122658b89C31183CeC4F15514F34624.wallet")
        // // log.info(tag,"pubkeysSoftware: ",pubkeysSoftware.length)
        // // assert(pubkeysSoftware.length > 3)
        // //verify all are paired
        //
        //
        // //
        // let metamaskWallet = app.wallets.filter((e:any) => e.type === "metamask")
        // assert(metamaskWallet.length === 1)
        // //log.info(tag,"metamaskWalletDescription: ",metamaskWallet)
        //
        // let keepkeyWallet = app.wallets.filter((e:any) => e.type === "keepkey")
        // assert(keepkeyWallet.length === 1)
        // //log.info(tag,"keepkeyWalletDescription: ",keepkeyWallet)
        //
        // let nativeWallet = app.wallets.filter((e:any) => e.type === "native")
        // assert(nativeWallet.length === 1)
        // //log.info(tag,"nativeWallet: ",nativeWallet)
        //
        // // app.refresh()
        // // log.info(tag,"checkpoint post refresh: ")
        // //
        // // let nativeWalletDescription1 = user2.walletDescriptions.filter((e:any) => e.type === "native")
        // // assert(nativeWalletDescription1)
        // // log.info(tag,"nativeWalletDescription1: ",nativeWalletDescription1)
        // //
        // // let metamaskWalletDescription1 = user2.walletDescriptions.filter((e:any) => e.type === "metamask")
        // // assert(metamaskWalletDescription1)
        // // log.info(tag,"metamaskWalletDescription1: ",metamaskWalletDescription1)
        // //
        // // let keepkeyWalletDescription1 = user2.walletDescriptions.filter((e:any) => e.type === "keepkey")
        // // assert(keepkeyWalletDescription1)
        // // log.info(tag,"keepkeyWalletDescription1: ",keepkeyWalletDescription1)
        //
        // //verify isPioneer
        // // assert(user2.isPioneer)
        // // assert(user2.pioneerImage)
        // // log.info(tag,"user2.pioneerImage: ",user2.pioneerImage)
        //
        // //switch context to metamask and get address
        //
        // // //path
        // // log.debug(tag,"ASSET: ",ASSET)
        // // let path = app.paths.filter((e:any) => e.symbol === ASSET)
        // // log.debug("path: ",path)
        // // log.debug("app.paths: ",app.paths.length)
        // // assert(path[0])
        // //
        // // let pubkey = app.pubkeys.filter((e:any) => e.symbol === ASSET)
        // // log.debug("pubkey: ",pubkey)
        // // log.debug("app.pubkeys: ",app.pubkeys.length)
        // // assert(pubkey[0])
        // //
        // // //verify you have a balance of selected asset
        // // let balance = app.balances.filter((e:any) => e.symbol === ASSET)
        // // log.debug("balance: ",balance)
        // // log.debug("balance: ",balance[0].balance)
        // // assert(balance)
        // // assert(balance[0])
        // // assert(balance[0].balance)
        //
        // //sync
        // log.info("app.pubkeys: ",app.pubkeys.length)
        // let pubkey = app.pubkeys.filter((e:any) => e.symbol === "ETH")
        // // log.info("pubkey: ",pubkey)
        // log.info("app.pubkeys: ",app.pubkeys.length)
        // assert(pubkey[0])
        //
        // // //sync pubkey
        // // let pubkeySynced = await app.getPubkey(pubkey[0].symbol, true)
        // // log.info("pubkeySynced: ",pubkeySynced)
        // // assert(pubkeySynced)
        // // assert(pubkeySynced.balances)
        //
        //balances
        let balance = app.balances.filter((e) => e.symbol === ASSET);
        log.info("balance: ", balance);
        log.info("balance: ", balance[0].balance);
        assert(balance);
        assert(balance[0]);
        assert(balance[0].balance);
        //
        // //
        // assert(app.wallet)
        //
        // //TODO context changing
        // //should have a default context always
        // let walletContext = await app.context
        // assert(walletContext)
        // log.info("walletContext: ",walletContext)
        //
        // //get wallets
        // let wallets = await app.wallets
        // log.info("wallets: ",wallets)
        // assert(wallets.length,3)
        //
        // //setBlockchainContext to eth
        // let ETH_BLOCKCHAIN = {
        //     blockchain: 'ethereum',
        //     caip: 'eip155:1/slip44:60',
        //     chainId: 1,
        //     description: 'more info here: https://ethereum.org This is a EVM network with chainId: 1 Follows EIP:155',
        //     explorer: 'https://ethereum.org',
        //     faucets: [],
        //     feeAssetCaip: 'eip155:1/slip44:60',
        //     feeAssetName: 'ethereum',
        //     feeAssetRank: 2,
        //     feeAssetSymbol: 'ETH',
        //     image: 'https://pioneers.dev/coins/ethereum-mainnet.png',
        //     isCharted: false,
        //     name: 'ethereum',
        //     network: 'ETH',
        //     service: null,
        //     symbol: 'ETH',
        //     tags: [
        //         'KeepKeySupport',
        //         'DappSupport',
        //         'WalletConnectSupport',
        //         'EVM',
        //         'EIP:155',
        //         'ethereum',
        //         'Ether',
        //         'ETH',
        //         1,
        //         null
        //     ],
        //     type: 'EVM'
        // }
        //
        // let setBlockchainContext = await app.setBlockchainContext(ETH_BLOCKCHAIN)
        // assert(setBlockchainContext)
        // log.info(tag,"setBlockchainContext: ",setBlockchainContext)
        // assert.strictEqual(app.blockchainContext.chainId, ETH_BLOCKCHAIN.chainId)
        //
        // const addressInfo = {
        //     addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
        //     coin: "Ethereum",
        //     scriptType: "ethereum",
        //     showDisplay: false,
        // };
        // const addressWallet0 = await wallets[0].wallet.ethGetAddress(addressInfo);
        // const addressWallet1 = await wallets[1].wallet.ethGetAddress(addressInfo);
        // const addressWallet2 = await wallets[2].wallet.ethGetAddress(addressInfo);
        // log.info(tag,"addressWallet0: ", addressWallet0);
        // log.info(tag,"addressWallet1: ", addressWallet1);
        // log.info(tag,"addressWallet2: ", addressWallet2);
        // log.info(tag,"Wallet0 type: ", wallets[0].type);
        // log.info(tag,"Wallet1 type: ", wallets[1].type);
        // log.info(tag,"Wallet2 type: ", wallets[2].type);
        //
        // //set to current wallet
        // let changeContext = await app.setContext(wallets[0].wallet)
        // log.info("changeContext: ",changeContext)
        // assert(changeContext)
        // assert.strictEqual(app.context, wallets[0].context)
        // assert.strictEqual(app.wallet.type, wallets[0].type)
        // assert(app.wallet)
        // // log.info("app.wallet: ",app.wallet)
        // log.info("pubkeyContext: ",app.pubkeyContext)
        //
        // // log.info(tag,"app.wallet: ",app.wallet)
        // const address = await app.wallet.ethGetAddress(addressInfo);
        // console.log("address0: ", address);
        // assert(address)
        // assert(app.pubkeyContext)
        // assert.strictEqual(address,app.pubkeyContext.master)
        // //get address on wallet on context
        //
        // //change context to 1 from 0
        // log.info("wallet.type: ",wallets[1].wallet.type)
        // let changeContext1 = await app.setContext(wallets[1].wallet)
        // log.info("changeContext: ",changeContext)
        // assert(changeContext)
        // assert(app.context, wallets[1])
        // assert(app.wallet)
        // log.info(tag,"app.wallet.type: ",app.wallet.type)
        // log.info(tag,"wallets[1].wallet.type: ",wallets[1].wallet.type)
        // log.info(tag,"wallets[0].wallet.type: ",wallets[0].wallet.type)
        // assert.strictEqual(app.wallet.type, wallets[1].wallet.type)
        //
        // const address1 = await app.wallet.ethGetAddress(addressInfo);
        // log.info(tag,"address1: ", address1);
        // log.info(tag,"app.pubkeyContext: ",app.pubkeyContext.address)
        // assert.strictEqual(address1,app.pubkeyContext.master)
        //
        // let changeContext2 = await app.setContext(wallets[2].wallet)
        // // log.info("changeContext: ",changeContext)
        // assert(changeContext)
        // assert(app.context, wallets[2])
        // assert(app.wallet)
        // const address2 = await app.wallet.ethGetAddress(addressInfo);
        // console.log("address2: ", address2);
        //
        // //verify wallet has changed
        //
        // let blockchainContext = await app.blockchainContext
        // assert(blockchainContext)
        // log.info("blockchainContext: ",blockchainContext)
        //
        // let BLOCKCHAIN_NEW = {
        //     "name": "polygon",
        //     "type": "EVM",
        //     "tags": [
        //         "KeepKeySupport",
        //         "WalletConnectSupport",
        //         "DappSupport",
        //         "Polygon Mainnet",
        //         "MATIC",
        //         "Polygon"
        //     ],
        //     "image": "https://pioneers.dev/coins/polygon.png",
        //     "blockchain": "polygon mainnet",
        //     "symbol": "POLYGON",
        //     "service": "https://polygon-rpc.com/",
        //     "chainId": 137,
        //     "network": [
        //         "https://polygon-rpc.com/",
        //         "https://rpc-mainnet.matic.network",
        //         "https://matic-mainnet.chainstacklabs.com",
        //         "https://rpc-mainnet.maticvigil.com",
        //         "https://rpc-mainnet.matic.quiknode.pro",
        //         "https://matic-mainnet-full-rpc.bwarelabs.com"
        //     ],
        //     "facts": [
        //         {
        //             "signer": "0x3f2329c9adfbccd9a84f52c906e936a42da18cb8",
        //             "payload": "{\"blockchain\":\"Polygon Mainnet\",\"symbol\":\"MATIC\",\"chainId\":137}",
        //             "signature": "0xef879877b626ec72ad68d3b0e5d62d95123e730b91e12c5bdaae5d5270c8e2b61e1f9a4a2c9b844de0a6dd4746ed79da6c8809a5a8a78fd8e03fd32ddaa810bf1c"
        //         }
        //     ],
        //     "infoURL": "https://polygon.technology/",
        //     "shortName": "MATIC",
        //     "nativeCurrency": {
        //         "name": "MATIC",
        //         "symbol": "MATIC",
        //         "decimals": 18
        //     },
        //     "faucets": []
        // }
        //
        // //set blockchain context
        // let changeBlockchainContext = await app.setBlockchainContext(BLOCKCHAIN_NEW)
        // assert(changeBlockchainContext)
        // log.info("changeBlockchainContext: ",changeBlockchainContext)
        //
        // let blockchainContextPost = await app.blockchainContext
        // log.info("blockchainContextPost: ",blockchainContextPost)
        //
        // // //set asset context
        // // let assetContext = await app.assetContext
        // // assert(assetContext)
        // // log.info("assetContext: ",assetContext)
        // //
        // // let changeAssetContext = await app.setAssetContext(ASSET)
        // // assert(changeAssetContext)
        // // log.info("changeAssetContext: ",changeAssetContext)
        // //
        // // //set asset context
        // // let assetContextPost = await app.assetContext
        // // assert(assetContextPost, ASSET)
        // // log.info("assetContextPost: ",assetContextPost)
        //
        // //pubkey context
        // let pubkeyContext = await app.pubkeyContext
        // assert(pubkeyContext)
        // log.info("pubkeyContext: ",pubkeyContext)
        //
        // //set pubkey context
        // let pubkeys = app.pubkeys
        // log.info("pubkeys: ",pubkeys)
        //
        // let pubkeyContextChange = await app.setPubkeyContext(pubkeys[3])
        // assert(pubkeyContextChange)
        // log.info("pubkeyContextChange: ",pubkeyContextChange)
        //
        //
        // //attempt to change wallet context to unpaired wallet
        //
        // //attempt to change blockchain context to unsupported by current wallet
        //
        // //attempt to change asset context to a unsupported asset of current blockchain
        //
        //
        // //listen to events
        //
        //
        // log.notice("****** TEST PASS ******")
        //process
        //process.exit(0)
    }
    catch (e) {
        log.error(e);
        //process
        process.exit(666);
    }
};
test_service();
