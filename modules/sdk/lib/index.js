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
const loggerdog_1 = __importDefault(require("@pioneer-platform/loggerdog"));
const log = (0, loggerdog_1.default)();
const swapkit_core_1 = require("@pioneer-platform/swapkit-core");
const pioneer_coins_1 = require("@pioneer-platform/pioneer-coins");
const connect_1 = require("./connect");
const support_1 = require("./support");
// @ts-ignore
const pioneer_client_1 = __importDefault(require("@pioneer-platform/pioneer-client"));
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
        this.assetContext = {};
        this.blockchainContext = {};
        this.wallets = [];
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
                let ethplorerApiKey = process.env.ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7';
                let covalentApiKey = process.env.COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q';
                let utxoApiKey = process.env.BLOCKCHAIR_API_KEY || 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf';
                let walletConnectProjectId = process.env.WALLET_CONNECT_PROJECT_ID || '';
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
                console.log("FAGGGOOOTTTSA");
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
                //get balances
                const chains = Object.keys(this.swapKit.connectedWallets);
                //calculate walletDaa
                const walletDataArray = await Promise.all(
                // @ts-ignore
                chains.map(this.swapKit.getWalletByChain));
                log.info("walletDataArray: ", walletDataArray);
                console.log("walletDataArray: ", walletDataArray);
                // @ts-ignore
                //balances
                // for(let i = 0; i < chains.length; i++){
                //     let chain = chains[i]
                //     try{
                //         let walletInfo = await this.swapKit.getWalletByChain(chain)
                //         // let walletInfo = await this.swapKit.getBalance(chain)
                //         console.log("walletInfo: ",walletInfo)
                //     }catch(e){
                //         log.error("Failed to get chain: ",chain)
                //         log.error("E:",e)
                //     }
                // }
                //
                // await sleep(1000)
                // log.info("resultPair: ", this.swapKit);
                //
                // let ethAddress = await this.swapKit.getAddress('ETH')
                // if(!ethAddress) throw Error("Failed to get eth address! can not pair wallet")
                // let context = wallet.toLowerCase() + ":" + ethAddress+".wallet"
                // log.info(tag,"context: ",context)
                // //get all pubkeys
                // let pubkeys = []
                // for(let i = 0; i < AllChainsSupported.length; i++){
                //     let chain = AllChainsSupported[i]
                //     log.info(tag,"chain: ",chain)
                //     try{
                //         let address = await this.swapKit.getAddress(chain)
                //         log.info(tag,"address: ",address)
                //         let pubkey = {
                //             context,
                //             wallet:walletSelected.type,
                //             symbol:chain,
                //             network:chain,
                //             blockchain:COIN_MAP_LONG[chain] || 'unknown',
                //             type:'address',
                //             script_type:'unknown',
                //             path:'unknown',
                //             addressNList:'unknown',
                //             networkCaip:shortListSymbolToCaip[chain],
                //             master:address,
                //             pubkey:address,
                //             address,
                //         }
                //         //exclude eip:155
                //         if(chain === 'ARB' || chain === 'AVAX' || chain === 'MATIC' || chain === 'OP' || chain === 'BSC'){
                //             //redundant pubkeys
                //         }else{
                //             pubkeys.push(pubkey)
                //             log.info(tag,"pubkey: ",pubkey)
                //         }
                //     }catch(e){
                //         log.error("failed on chain: ",chain)
                //         log.error("e: ",e)
                //     }
                // }
                // //build pubkeys
                // log.info(tag,"pubkeys: ",pubkeys)
                // let register = {
                //     username:this.username,
                //     blockchains:AllChainsSupported,
                //     context,
                //     publicAddress:ethAddress,
                //     walletDescription:{
                //         context,
                //         type:wallet
                //     },
                //     data:{
                //         pubkeys
                //     },
                //     queryKey:this.queryKey,
                //     auth:'lol',
                //     provider:'lol'
                // }
                // log.info(tag,"register payload: ",register)
                // log.info(tag,"register payload: ",JSON.stringify(register))
                // let result = await this.pioneer.Register(register)
                // log.info(tag,"result: ",result.data)
                // //register with pioneer
                // //@ts-ignore
                // if(result.data.balances)this.balances = result.data.balances
                // //@ts-ignore
                // if(result.data.nfts)this.nfts = result.data.nfts
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
    }
}
exports.SDK = SDK;
exports.default = SDK;
