/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */
const TAG = " | Pioneer-sdk | "
// @ts-ignore
import loggerdog from "@pioneer-platform/loggerdog";
const log = loggerdog();
// @ts-ignore
import { Chain, EVMChainList, WalletOption } from "@pioneer-platform/types";
import { SwapKitCore } from '@pioneer-platform/swapkit-core';
import {
    getPaths,
    COIN_MAP_LONG,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
import { initializeWallets } from "./connect";
import { availableChainsByWallet } from "./support";
// @ts-ignore
import Pioneer from "@pioneer-platform/pioneer-client"
// @ts-ignore
import {shortListNameToCaip,shortListSymbolToCaip,evmCaips, primaryBlockchains, primaryAssets } from "@pioneer-platform/pioneer-caip"
// @ts-ignore
import * as Events from "@pioneer-platform/pioneer-events";


export class SDK {
    private status: string;
    private username: string;
    private queryKey: string;
    private wss: string;
    private spec: any;
    private context: string;
    private assetContext: any;
    private blockchainContext: any;
    private pubkeyContext: any;
    private swapKit: any;
    private pioneer: any;
    private paths: any[];
    private pubkeys: any[];
    private wallets: any[];
    private balances: any[];
    private nfts: any[];
    private pairWallet: (wallet: any) => Promise<any>;
    // public startSocket: () => Promise<any>;
    // public stopSocket: () => any;
    // public sendToAddress: (tx:any) => Promise<any>;
    // public swapQuote: (tx:any) => Promise<any>;
    // public build: (tx:any) => Promise<any>;
    // public sign: (tx:any, wallet:any) => Promise<any>;
    // public broadcast: (tx:any) => Promise<any>;
    private setContext: (context: string) => Promise<{ success: boolean }>;
    constructor(spec:string,config:any) {
        this.status = 'preInit'
        this.spec = config.spec || 'https://pioneers.dev/spec/swagger'
        this.wss = config.wss || 'wss://pioneers.dev'
        this.username = config.username // or generate?
        this.queryKey = config.queryKey // or generate?
        this.paths = [...config.paths, ...getPaths()];
        this.pubkeys = []
        this.balances = []
        this.nfts = []
        this.pioneer = null
        this.swapKit = null
        this.context = ""
        this.assetContext = null
        this.blockchainContext = null
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

                //init wallets
                let {wallets,walletsVerbose} = await initializeWallets()
                this.wallets = walletsVerbose
                // log.info("wallets",this.wallets)

                //init swapkit
                this.swapKit = new SwapKitCore();

                // log.info(tag,"this.swapKit: ",this.swapKit)
                let ethplorerApiKey = process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7'
                let covalentApiKey = process.env.VITE_COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q'
                let utxoApiKey = process.env.VITE_BLOCKCHAIR_API_KEY || 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf'
                let walletConnectProjectId = process.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
                let stagenet = false
                let configKit = {
                    config: {
                        ethplorerApiKey,
                        covalentApiKey,
                        utxoApiKey,
                        walletConnectProjectId,
                        stagenet,
                    },
                    wallets,
                }
                log.info(tag,"configKit: ",configKit)
                await this.swapKit.extend(configKit);
                //done registering, now get the user
                //this.refresh()
                if(!this.pioneer) throw Error("Failed to init pioneer server!")
                return this.pioneer
            } catch (e) {
                log.error(tag, "e: ", e)
            }
        }
        this.pairWallet = async function (wallet:string) {
            let tag = TAG + " | pairWallet | "
            try {
                log.debug(tag,"Pairing Wallet")
                if(!wallet) throw Error("Must have wallet to pair!")

                //filter wallets by type
                let walletSelected:any = this.wallets.filter((w:any) => w.type === wallet)
                walletSelected = walletSelected[0]
                // log.info(tag,"walletSelected: ",walletSelected)

                //supported chains
                let AllChainsSupported = availableChainsByWallet[walletSelected.type]
                // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected)
                // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected.wallet.connectMethodName)
                log.info("AllChainsSupported: ", AllChainsSupported);
                const resultPair = await this.swapKit[walletSelected.wallet.connectMethodName](AllChainsSupported);
                log.info("resultPair: ", resultPair);
                log.info("this.swapKit: ", this.swapKit);
                if(resultPair){
                    //update
                    let matchingWalletIndex = this.wallets.findIndex((w) => w.type === wallet);
                    log.info(tag,"matchingWalletIndex: ",matchingWalletIndex)
                        //get balances
                    let ethAddress = await this.swapKit.getAddress('ETH')
                    if(!ethAddress) throw Error("Failed to get eth address! can not pair wallet")
                    let context = wallet.toLowerCase() + ":" + ethAddress+".wallet"
                    log.info(tag,"context: ",context)
                    //add context to wallet
                    this.wallets[matchingWalletIndex].context = context
                    this.wallets[matchingWalletIndex].connected = true;
                    this.wallets[matchingWalletIndex].status = 'connected';
                    this.setContext(context)
                    //get all pubkeys
                    let pubkeys = []
                    for(let i = 0; i < AllChainsSupported.length; i++){
                        let chain = AllChainsSupported[i]
                        log.info(tag,"chain: ",chain)
                        try{
                            let walletInfo = await this.swapKit.getWalletByChain(chain)
                            log.info(tag,"walletInfo: ",walletInfo)
                            let address = walletInfo.address
                            log.info(tag,"address: ",address)
                            let pubkey = {
                                context,
                                wallet:walletSelected.type,
                                symbol:chain,
                                network:chain,
                                blockchain:COIN_MAP_LONG[chain] || 'unknown',
                                type:'address',
                                script_type:'unknown',
                                path:'unknown',
                                addressNList:'unknown',
                                networkCaip:shortListSymbolToCaip[chain],
                                master:address,
                                pubkey:address,
                                address,
                            }
                            //exclude eip:155
                            if(chain === 'ARB' || chain === 'AVAX' || chain === 'MATIC' || chain === 'OP' || chain === 'BSC'){
                                //redundant pubkeys
                            }else{
                                pubkeys.push(pubkey)
                                log.info(tag,"pubkey: ",pubkey)
                            }
                            //get balance
                            this.balances.push(walletInfo.balance)
                        }catch(e){
                            log.error("failed on chain: ",chain)
                            log.error("e: ",e)
                        }
                    }
                } else {
                    throw Error("Failed to pair wallet! "+walletSelected.type)
                }

                return true
            } catch (e) {
                log.error(tag, "e: ", e)
                //response:
                log.error(tag, "e: ", JSON.stringify(e))
                // log.error(tag, "e2: ", e.response)
                // log.error(tag, "e3: ", e.response.data)
            }
        }
        this.setContext = async function (context:string) {
            let tag = TAG + " | setContext | "
            try{
                log.info(tag,"context: ",context)
                const isContextExist = this.wallets.some((wallet: any) => wallet.context === context);
                log.info(tag,"isContextExist: ",isContextExist)
                if(isContextExist){
                    //if success
                    this.context = context
                    // let result = await this.pioneer.SetContext({context})
                    // log.debug(tag,"result: ",result)
                    if(!this.blockchainContext){
                        //set to ETH (default)
                        this.blockchainContext = primaryBlockchains['eip155:1/slip44:60']
                    }
                    if(!this.assetContext){
                        this.assetContext = primaryAssets['eip155:1/slip44:60']
                    }
                    //if no output set to BTC IF wallet supports it, if not USDC (TODO set to PRO token)

                    //pubkey pubkey context
                    let blockchain = this.blockchainContext
                    //get pubkey for blockchain
                    log.debug(tag,"this.pubkeys: ",this.pubkeys)
                    log.debug(tag,"blockchainContext: ",blockchain)
                    log.debug(tag,"blockchain: ",blockchain.name)
                    log.debug(tag,"context: ",context)
                    let pubkeysForContext = this.pubkeys.filter((item: { context: string }) => item.context === context);
                    log.debug(tag, "pubkeysForContext: ", pubkeysForContext);

                    // let pubkey = pubkeysForContext.find(
                    //     (item: { blockchain: any; context: string }) => item.blockchain === blockchain.name && item.context === context
                    // );
                    // log.debug(tag, "pubkey: ", pubkey);
                    //
                    // if(pubkey) {
                    //     this.pubkeyContext = pubkey
                    //     log.debug(tag,"pubkeyContext: ",this.pubkeyContext)
                    // } else {
                    //     log.debug(tag,"pubkeys: ",this.pubkeys)
                    //     log.debug(tag,"pubkeysForContext: ",pubkeysForContext)
                    //
                    //     throw Error("unable to find ("+blockchain.name+") pubkey for context! "+context)
                    // }
                    return {success:true}
                }else{
                    throw Error("Wallet context not found paired! con not set context to unpaired wallet!"+context)
                }
            }catch(e){
                log.error(tag,e)
                throw e
            }
        }
    }
}

export default SDK
