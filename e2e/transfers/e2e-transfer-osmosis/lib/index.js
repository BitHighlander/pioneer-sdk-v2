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
const TAG = " | e2e-test | ";
const core = __importStar(require("@shapeshiftoss/hdwallet-core"));
const hdwallet_native_1 = require("@shapeshiftoss/hdwallet-native");
const keepkey_sdk_1 = require("@keepkey/keepkey-sdk");
const hdwallet_keepkey_rest_1 = require("@keepkey/hdwallet-keepkey-rest");
const log = require("@pioneer-platform/loggerdog")();
let assert = require('assert');
let SDK = require('@pioneer-sdk/sdk');
let wait = require('wait-promise');
let sleep = wait.sleep;
let BLOCKCHAIN = 'osmosis';
let ASSET = 'OSMO';
let MIN_BALANCE = process.env['MIN_BALANCE_OSMO'] || "0.004";
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.001";
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json';
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev';
let FAUCET_OSMO_ADDRESS = process.env['FAUCET_OSMO_ADDRESS'];
let FAUCET_ADDRESS = FAUCET_OSMO_ADDRESS;
if (!FAUCET_ADDRESS)
    throw Error("Need Faucet Address!");
//hdwallet Keepkey
let noBroadcast = false;
console.log("spec: ", spec);
console.log("wss: ", wss);
let blockchains = [
    'bitcoin', 'ethereum', 'thorchain', 'bitcoincash', 'litecoin', 'binance', 'cosmos', 'dogecoin', 'osmosis', 'avalanche'
];
let txid;
let invocationId;
let IS_SIGNED;
const start_keepkey_controller = async function () {
    try {
        let serviceKey = "135085f0-5c73-4bb1-abf0-04ddfc710b07";
        let config = {
            apiKey: serviceKey,
            pairingInfo: {
                name: 'ShapeShift',
                imageUrl: 'https://assets.coincap.io/assets/icons/fox@2x.png',
                basePath: 'http://localhost:1646/spec/swagger.json',
                url: 'https://app.shapeshift.com',
            },
        };
        let sdk = await keepkey_sdk_1.KeepKeySdk.create(config);
        console.log(config.apiKey);
        const keyring = new core.Keyring();
        // @ts-ignore
        let wallet = await hdwallet_keepkey_rest_1.KkRestAdapter.useKeyring(keyring).pairDevice(sdk);
        console.log("wallet: ", wallet);
        return wallet;
    }
    catch (e) {
        console.error(e);
    }
};
const start_software_wallet = async function () {
    try {
        let mnemonic = process.env['WALLET_MAIN'];
        if (!mnemonic)
            throw Error("Unable to load wallet! missing env WALLET_MAIN");
        const keyring = new core.Keyring();
        const nativeAdapter = hdwallet_native_1.NativeAdapter.useKeyring(keyring);
        let wallet = await nativeAdapter.pairDevice("testid");
        //@ts-ignore
        await nativeAdapter.initialize();
        // @ts-ignore
        wallet.loadDevice({ mnemonic });
        if (!wallet)
            throw Error("failed to init wallet!");
        return wallet;
    }
    catch (e) {
        console.error(e);
    }
};
const test_service = async function () {
    let tag = TAG + " | test_service | ";
    try {
        console.time('start2paired');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        //if force new user
        //const queryKey = "sdk:pair-keepkey:"+uuidv4();
        const queryKey = "sdk:pair-keepkey:test-12345";
        assert(queryKey);
        const username = "sdk:test-user-12345";
        assert(username);
        let config = {
            blockchains,
            username,
            queryKey,
            spec,
            wss,
            paths: []
        };
        let app = new SDK.SDK(spec, config);
        // log.debug(tag,"app: ",app)
        //get HDwallet
        let wallet = await start_keepkey_controller();
        // let wallet = await start_software_wallet()
        // log.debug(tag,"wallet: ",wallet)
        //init with HDwallet
        log.debug(tag, "Pre-init:");
        let result = await app.init(wallet);
        log.debug(tag, "result: ", result);
        let send = {
            blockchain: BLOCKCHAIN,
            asset: ASSET,
            address: FAUCET_ADDRESS,
            amount: TEST_AMOUNT,
            noBroadcast: true
        };
        let tx = {
            type: 'sendToAddress',
            payload: send
        };
        console.log("tx: ", tx);
        let invocationId = await app.build(tx);
        log.debug(tag, "invocationId: ", invocationId);
        //sign
        let resultSign = await app.sign(invocationId);
        log.debug(tag, "resultSign: ", resultSign);
        //broadcast
        // let payload = {
        //     noBroadcast:true,
        //     sync:false
        // }
        //get txid
        let payload = {
            noBroadcast: false,
            sync: true,
            invocationId
        };
        let resultBroadcast = await app.broadcast(payload);
        log.debug(tag, "resultBroadcast: ", resultBroadcast);
        //
        // /*
        //     Status codes
        //     -1: errored
        //      0: unknown
        //      1: built
        //      2: broadcasted
        //      3: confirmed
        //      4: fullfilled (swap completed)
        //  */
        // //monitor tx lifecycle
        // let isConfirmed = false
        // let isFullfilled = false
        // let fullfillmentTxid = false
        // let currentStatus
        // let statusCode = 0
        //
        // //wait till confirmed
        // while(!isConfirmed){
        //     log.debug("check for confirmations")
        //     //
        //     let invocationInfo = await app.getInvocation(invocationId)
        //     log.debug(tag,"invocationInfo: (VIEW) ",invocationInfo)
        //     log.debug(tag,"invocationInfo: (VIEW): ",invocationInfo.state)
        //
        //     if(invocationInfo.broadcast.noBroadcast){
        //         log.notice(tag,"noBroadcast flag found: exiting ")
        //         statusCode = 3
        //         isConfirmed = true
        //     }
        //
        //     if(invocationInfo && invocationInfo.isConfirmed){
        //         log.test(tag,"Confirmed!")
        //         statusCode = 3
        //         isConfirmed = true
        //         console.timeEnd('timeToConfirmed')
        //         console.time('confirm2fullfillment')
        //     } else {
        //         log.test(tag,"Not Confirmed!",new Date().getTime())
        //     }
        //
        //     await sleep(3000)
        //     log.debug("sleep over")
        // }
        log.notice("****** TEST PASS ******");
        //process
        process.exit(0);
    }
    catch (e) {
        log.error(e);
        //process
        process.exit(666);
    }
};
test_service();
