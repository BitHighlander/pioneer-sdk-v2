"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK = void 0;
/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */
const TAG = " | Pioneer-sdk | ";
const events_1 = __importDefault(require("events"));
// @ts-ignore
const loggerdog_1 = __importDefault(require("@pioneer-platform/loggerdog"));
const log = (0, loggerdog_1.default)();
const swapkit_core_1 = require("@pioneer-platform/swapkit-core");
const pioneer_coins_1 = require("@pioneer-platform/pioneer-coins");
const connect_1 = require("./connect");
const support_1 = require("./support");
// @ts-ignore
const pioneer_client_1 = __importDefault(require("@pioneer-platform/pioneer-client"));
// @ts-ignore
const pioneer_caip_1 = require("@pioneer-platform/pioneer-caip");
class SDK {
    constructor(spec, config) {
        this.status = 'preInit';
        this.spec = config.spec || 'https://pioneers.dev/spec/swagger';
        this.wss = config.wss || 'wss://pioneers.dev';
        this.username = config.username; // or generate?
        this.queryKey = config.queryKey; // or generate?
        this.paths = [...config.paths, ...(0, pioneer_coins_1.getPaths)()];
        this.pubkeys = [];
        this.balances = [];
        this.nfts = [];
        this.pioneer = null;
        this.swapKit = null;
        this.context = "";
        this.pubkeyContext = null;
        this.assetContext = null;
        this.blockchainContext = null;
        this.outboundAssetContext = null;
        this.outboundBlockchainContext = null;
        this.outboundPubkeyContext = null;
        this.wallets = [];
        this.events = new events_1.default();
        // @ts-ignore
        this.init = async function () {
            let tag = TAG + " | init | ";
            try {
                if (!this.username)
                    throw Error("username required!");
                if (!this.queryKey)
                    throw Error("queryKey required!");
                if (!this.wss)
                    throw Error("wss required!");
                let PioneerClient = new pioneer_client_1.default(config.spec, config);
                this.pioneer = await PioneerClient.init();
                if (!this.pioneer)
                    throw Error("Fialed to init pioneer server!");
                //init wallets
                let { wallets, walletsVerbose } = await (0, connect_1.initializeWallets)();
                this.wallets = walletsVerbose;
                // log.info("wallets",this.wallets)
                //init swapkit
                this.swapKit = new swapkit_core_1.SwapKitCore();
                // log.info(tag,"this.swapKit: ",this.swapKit)
                let ethplorerApiKey = process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7';
                let covalentApiKey = process.env.VITE_COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q';
                let utxoApiKey = process.env.VITE_BLOCKCHAIR_API_KEY || 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf';
                let walletConnectProjectId = process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16';
                let stagenet = false;
                let configKit = {
                    config: {
                        ethplorerApiKey,
                        covalentApiKey,
                        utxoApiKey,
                        walletConnectProjectId,
                        stagenet,
                    },
                    wallets,
                };
                log.info(tag, "configKit: ", configKit);
                await this.swapKit.extend(configKit);
                this.events.emit("SET_STATUS", 'init');
                //done registering, now get the user
                //this.refresh()
                if (!this.pioneer)
                    throw Error("Failed to init pioneer server!");
                return this.pioneer;
            }
            catch (e) {
                log.error(tag, "e: ", e);
            }
        };
        this.pairWallet = async function (wallet) {
            let tag = TAG + " | pairWallet | ";
            try {
                log.debug(tag, "Pairing Wallet");
                if (!wallet)
                    throw Error("Must have wallet to pair!");
                //filter wallets by type
                let walletSelected = this.wallets.filter((w) => w.type === wallet);
                walletSelected = walletSelected[0];
                // log.info(tag,"walletSelected: ",walletSelected)
                //supported chains
                let AllChainsSupported = support_1.availableChainsByWallet[walletSelected.type];
                // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected)
                // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected.wallet.connectMethodName)
                log.info("AllChainsSupported: ", AllChainsSupported);
                const resultPair = await this.swapKit[walletSelected.wallet.connectMethodName](AllChainsSupported);
                log.info("resultPair: ", resultPair);
                log.info("this.swapKit: ", this.swapKit);
                if (resultPair) {
                    //update
                    let matchingWalletIndex = this.wallets.findIndex((w) => w.type === wallet);
                    log.info(tag, "matchingWalletIndex: ", matchingWalletIndex);
                    //get balances
                    let ethAddress = await this.swapKit.getAddress('ETH');
                    if (!ethAddress)
                        throw Error("Failed to get eth address! can not pair wallet");
                    let context = wallet.toLowerCase() + ":" + ethAddress + ".wallet";
                    log.info(tag, "context: ", context);
                    this.events.emit("CONTEXT", context);
                    //add context to wallet
                    this.wallets[matchingWalletIndex].context = context;
                    this.wallets[matchingWalletIndex].connected = true;
                    this.wallets[matchingWalletIndex].status = 'connected';
                    this.setContext(context);
                    this.refresh(context);
                }
                else {
                    throw Error("Failed to pair wallet! " + walletSelected.type);
                }
                return true;
            }
            catch (e) {
                log.error(tag, "e: ", e);
                //response:
                log.error(tag, "e: ", JSON.stringify(e));
                // log.error(tag, "e2: ", e.response)
                // log.error(tag, "e3: ", e.response.data)
            }
        };
        this.refresh = async function (context) {
            let tag = TAG + " | refresh | ";
            try {
                //verify context exists
                log.info(tag, "context: ", context);
                const walletWithContext = this.wallets.find((wallet) => wallet.context === context);
                if (!walletWithContext)
                    throw Error("Context does not exist! " + context);
                log.info(tag, "walletWithContext: ", walletWithContext);
                //get chains of wallet
                const chains = Object.keys(this.swapKit.connectedWallets);
                //get address array
                const addressArray = await Promise.all(
                // @ts-ignore
                chains.map(this.swapKit.getAddress));
                log.info(tag, "addressArray: ", addressArray);
                for (let i = 0; i < chains.length; i++) {
                    let chain = chains[i];
                    let address = addressArray[i];
                    let pubkey = {
                        context,
                        // wallet:walletSelected.type,
                        symbol: chain,
                        blockchain: pioneer_coins_1.COIN_MAP_LONG[chain] || 'unknown',
                        type: 'address',
                        caip: pioneer_caip_1.shortListSymbolToCaip[chain],
                        master: address,
                        pubkey: address,
                        address,
                    };
                    this.pubkeys.push(pubkey);
                }
                this.events.emit("SET_PUBKEYS", this.pubkeys);
                //set pubkeys
                //calculate walletDaa
                const walletDataArray = await Promise.all(
                // @ts-ignore
                chains.map(this.swapKit.getWalletByChain));
                log.info(tag, "walletDataArray: ", walletDataArray);
                //set balances
                for (let i = 0; i < walletDataArray.length; i++) {
                    let walletData = walletDataArray[i];
                    log.info(tag, "walletData: ", walletData);
                    let chain = chains[i];
                    log.info(tag, "chain: ", chain);
                    for (let j = 0; j < walletData.balance.length; j++) {
                        let balance = walletData.balance[j];
                        log.info(tag, "balance: ", balance);
                        this.balances.push(balance);
                    }
                }
                this.events.emit("SET_BALANCES", this.balances);
                this.assetContext = this.balances[0];
                this.events.emit("SET_ASSET_CONTEXT", this.assetContext);
                this.outboundAssetContext = this.balances[1];
                this.events.emit("SET_OUTBOUND_ASSET_CONTEXT", this.outboundAssetContext);
                //set defaults
                // if(!this.blockchainContext)this.blockchainContext = primaryBlockchains['eip155:1/slip44:60']
                // if(!this.assetContext)this.assetContext = primaryAssets['eip155:1/slip44:60']
                // //set pubkey for context
                // let pubkeysForContext = this.pubkeys.filter((item: { context: string }) => item.context === context);
                // log.info(tag, "pubkeysForContext: ", pubkeysForContext)
                // log.info(tag, "this.blockchainContext.caip: ", this.blockchainContext.caip)
                //pubkey for blockchain context
                // let pubkeysForBlockchainContext = this.pubkeys.find((item: { caip: string }) => item.caip === this.blockchainContext.caip);
                // log.info(tag, "pubkeysForBlockchainContext: ", pubkeysForBlockchainContext)
                // if(pubkeysForBlockchainContext)this.pubkeyContext = pubkeysForBlockchainContext
                // //TODO if no pubkey for blockchain context, then dont allow context switching
                // this.events.emit("SET_PUBKEY_CONTEXT", this.pubkeyContext);
                return true;
            }
            catch (e) {
                log.error(tag, "e: ", e);
            }
        };
        this.setContext = async function (context) {
            let tag = TAG + " | setContext | ";
            try {
                log.info(tag, "context: ", context);
                const isContextExist = this.wallets.some((wallet) => wallet.context === context);
                log.info(tag, "isContextExist: ", isContextExist);
                if (isContextExist) {
                    //if success
                    this.context = context;
                    this.events.emit("CONTEXT", context);
                    //TODO refresh
                    // if(this.blockchainContext && this.assetContext){
                    //     //update pubkey context
                    //     let blockchain = this.blockchainContext
                    //     //get pubkey for blockchain
                    //     log.info(tag,"this.pubkeys: ",this.pubkeys)
                    //     log.info(tag,"blockchainContext: ",blockchain)
                    //     log.info(tag,"blockchain: ",blockchain.name)
                    //     log.info(tag,"context: ",context)
                    //     let pubkeysForContext = this.pubkeys.filter((item: { context: string }) => item.context === context);
                    //     log.info(tag, "pubkeysForContext: ", pubkeysForContext);
                    //
                    //     let pubkey = pubkeysForContext.find(
                    //         (item: { blockchain: any; context: string }) => item.blockchain === blockchain.name && item.context === context
                    //     );
                    //     log.info(tag, "pubkey: ", pubkey);
                    //
                    //     if(pubkey) {
                    //         this.pubkeyContext = pubkey
                    //         log.info(tag,"pubkeyContext: ",this.pubkeyContext)
                    //     } else {
                    //         log.info(tag,"pubkeys: ",this.pubkeys)
                    //         log.info(tag,"pubkeysForContext: ",pubkeysForContext)
                    //
                    //         throw Error("unable to find ("+blockchain.name+") pubkey for context! "+context)
                    //     }
                    // }
                    return { success: true };
                }
                else {
                    throw Error("Wallet context not found paired! con not set context to unpaired wallet!" + context);
                }
            }
            catch (e) {
                log.error(tag, e);
                throw e;
            }
        };
        this.setAssetContext = async function (asset) {
            let tag = TAG + " | setAssetContext | ";
            try {
                if (asset && this.assetContext && this.assetContext !== asset) {
                    this.assetContext = asset;
                    this.events.emit("SET_ASSET_CONTEXT", asset);
                    return { success: true };
                }
                else {
                    return { success: false, error: "already asset context=" + asset };
                }
            }
            catch (e) {
                log.error(tag, "e: ", e);
            }
        };
        this.setOutboundAssetContext = async function (asset) {
            let tag = TAG + " | setOutputAssetContext | ";
            try {
                if (asset && this.outboundAssetContext && this.outboundAssetContext !== asset) {
                    this.outboundAssetContext = asset;
                    this.events.emit("SET_OUTBOUND_ASSET_CONTEXT", asset);
                    return { success: true };
                }
                else {
                    return { success: false, error: "already asset context=" + asset };
                }
            }
            catch (e) {
                log.error(tag, "e: ", e);
            }
        };
    }
}
exports.SDK = SDK;
exports.default = SDK;
