/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */
const TAG = " | Pioneer-sdk | "
const log = require("@pioneer-platform/loggerdog")()
import { Chain, EVMChainList, WalletOption } from "@pioneer-platform/types";
import { SwapKitCore } from '@pioneer-platform/swapkit-core';
let {
    blockchains,
    getPaths,
    getPrecision,
    getExplorerUrl,
    getExplorerAddressUrl,
    getExplorerTxUrl,
    baseAmountToNative,
    nativeToBaseAmount,
    getNativeAssetForBlockchain,
    assetToBase,
    assetAmount,
    getSwapProtocals,
    xpubConvert,
    addressNListToBIP32,
    COIN_MAP,
    COIN_MAP_LONG,
    COIN_MAP_KEEPKEY_LONG,
    getRangoBlockchainName
} = require('@pioneer-platform/pioneer-coins')

// @ts-ignore
import Pioneer from "@pioneer-platform/pioneer-client"

//@ts-ignore
if (typeof window === 'undefined') {
    //@ts-ignore
    global.window = {};
}
//@ts-ignore
if (typeof localStorage === 'undefined') {
    //@ts-ignore
    global.localStorage = {
        getItem: function (key:string) {
            return this[key];
        },
        setItem: function (key:string, value:string) {
            this[key] = value;
        },
        removeItem: function (key:string) {
            delete this[key];
        }
    };
}

export class SDK {
    private status: string;
    private username: string;
    private queryKey: string;
    private wss: string;
    private spec: any;
    private paths: any[];
    private pubkeys: any[];
    private context: string;
    private assetContext: any;
    private blockchainContext: any;
    private wallets: any[];
    private swapKit: any;
    private pioneer: any;
    private pairWallet: (wallet: any) => Promise<any>;
    // public startSocket: () => Promise<any>;
    // public stopSocket: () => any;
    // public sendToAddress: (tx:any) => Promise<any>;
    // public swapQuote: (tx:any) => Promise<any>;
    // public build: (tx:any) => Promise<any>;
    // public sign: (tx:any, wallet:any) => Promise<any>;
    // public broadcast: (tx:any) => Promise<any>;
    constructor(spec:string,config:any) {
        this.status = 'preInit'
        this.spec = config.spec || 'https://pioneers.dev/spec/swagger'
        this.wss = config.wss || 'wss://pioneers.dev'
        this.username = config.username // or generate?
        this.queryKey = config.queryKey // or generate?
        this.paths = [...config.paths, ...getPaths()];
        this.pubkeys = []
        this.pioneer = null
        this.swapKit = null
        this.context = ""
        this.assetContext = {}
        this.blockchainContext = {}
        this.wallets = []
        // @ts-ignore
        this.init = async function () {
            let tag = TAG + " | init | "
            try {
                if(!this.username) throw Error("username required!")
                if(!this.queryKey) throw Error("queryKey required!")
                if(!this.wss) throw Error("wss required!")

                let PioneerClient = new Pioneer(config.spec,config)
                this.pioneer = await PioneerClient.init()
                if(!this.pioneer)throw Error("Fialed to init pioneer server!")

                //init swapkit
                this.swapKit = new SwapKitCore();

                //done registering, now get the user
                //this.refresh()
                if(!this.pioneer) throw Error("Failed to init pioneer server!")
                return this.pioneer
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.pairWallet = async function (wallet:any) {
            let tag = TAG + " | pairWallet | "
            try {
                log.debug(tag,"Pairing Wallet")
                if(!wallet) throw Error("Must have wallet to pair!")

                log.info(tag,"this.swapKit: ",this.swapKit)
                let ethplorerApiKey = process.env.ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7'
                let covalentApiKey = process.env.COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q'
                let utxoApiKey = process.env.BLOCKCHAIR_API_KEY || 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf'
                let walletConnectProjectId = process.env.WALLET_CONNECT_PROJECT_ID || 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf'
                let stagenet = false

                await this.swapKit.extend({
                    config: {
                        ethplorerApiKey,
                        covalentApiKey,
                        utxoApiKey,
                        walletConnectProjectId,
                        stagenet,
                    },
                    wallets: [wallet],
                });

                const AllChainsSupported = [
                    Chain.Arbitrum,
                    Chain.Avalanche,
                    Chain.Binance,
                    Chain.BinanceSmartChain,
                    Chain.Bitcoin,
                    Chain.BitcoinCash,
                    Chain.Cosmos,
                    Chain.Dogecoin,
                    Chain.Ethereum,
                    Chain.Litecoin,
                    Chain.Optimism,
                    Chain.Polygon,
                    Chain.THORChain,
                ] as Chain[];

                const resultKeepKey = await this.swapKit.connectKeepKey(AllChainsSupported);
                console.log("resultKeepKey: ", resultKeepKey);
                console.log("client: ", this.swapKit);

                return true
            } catch (e) {
                log.error(tag, "e: ", e)
                //response:
                log.error(tag, "e: ", JSON.stringify(e))
                // log.error(tag, "e2: ", e.response)
                // log.error(tag, "e3: ", e.response.data)
            }
        }
    }
}

export default SDK
