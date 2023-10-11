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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWallets = void 0;
const TAG = " | connectWallets | ";
const types_1 = require("@pioneer-platform/types");
const support_1 = require("./support");
async function initializeWallets() {
    let tag = TAG + " | initializeWallets | ";
    const wallets = [];
    const walletsVerbose = [];
    // Importing wallets
    const { keepkeyWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/keepkey')));
    const { evmWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/evm-web3-wallets')));
    const { keplrWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/keplr')));
    const { keystoreWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/keystore')));
    const { metamaskWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/metamask')));
    const { ledgerWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/ledger')));
    const { okxWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/okx')));
    const { trezorWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/trezor')));
    const { walletconnectWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/walletconnect')));
    const { xdefiWallet } = await Promise.resolve().then(() => __importStar(require('@pioneer-platform/xdefi')));
    // Initialize and push each wallet into the wallets array
    let walletKeepKey = {
        type: types_1.WalletOption.KEEPKEY,
        icon: 'https://pioneers.dev/coins/keepkey.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.KEEPKEY],
        wallet: keepkeyWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(keepkeyWallet);
    walletsVerbose.push(walletKeepKey);
    let walletMetaMask = {
        type: types_1.WalletOption.METAMASK,
        icon: 'https://pioneers.dev/coins/metamask.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.METAMASK],
        wallet: metamaskWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(metamaskWallet);
    walletsVerbose.push(walletMetaMask);
    let walletEVM = {
        type: 'EVM',
        icon: 'https://pioneers.dev/coins/evm.png',
        chains: support_1.availableChainsByWallet['EVM'],
        wallet: evmWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(evmWallet);
    walletsVerbose.push(walletEVM);
    let walletKeplr = {
        type: types_1.WalletOption.KEPLR,
        icon: 'https://pioneers.dev/coins/keplr.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.KEPLR],
        wallet: keplrWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(keplrWallet);
    walletsVerbose.push(walletKeplr);
    let walletKeystore = {
        type: types_1.WalletOption.KEYSTORE,
        icon: 'https://pioneers.dev/coins/keystore.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.KEYSTORE],
        wallet: keystoreWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(keystoreWallet);
    walletsVerbose.push(walletKeystore);
    let walletLedger = {
        type: types_1.WalletOption.LEDGER,
        icon: 'https://pioneers.dev/coins/ledger.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.LEDGER],
        wallet: ledgerWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(ledgerWallet);
    walletsVerbose.push(walletLedger);
    let walletOKX = {
        type: types_1.WalletOption.OKX,
        icon: 'https://pioneers.dev/coins/okx.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.OKX],
        wallet: okxWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(okxWallet);
    walletsVerbose.push(walletOKX);
    let walletTrezor = {
        type: types_1.WalletOption.TREZOR,
        icon: 'https://pioneers.dev/coins/trezor.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.TREZOR],
        wallet: trezorWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(trezorWallet);
    walletsVerbose.push(walletTrezor);
    let walletWalletConnect = {
        type: types_1.WalletOption.WALLETCONNECT,
        icon: 'https://pioneers.dev/coins/walletconnect.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.WALLETCONNECT],
        wallet: walletconnectWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(walletconnectWallet);
    walletsVerbose.push(walletWalletConnect);
    let walletXDefi = {
        type: types_1.WalletOption.XDEFI,
        icon: 'https://pioneers.dev/coins/xdefi.png',
        chains: support_1.availableChainsByWallet[types_1.WalletOption.XDEFI],
        wallet: xdefiWallet,
        status: 'offline',
        isConnected: false
    };
    wallets.push(xdefiWallet);
    walletsVerbose.push(walletXDefi);
    //TODO test each for detection
    return { wallets, walletsVerbose };
}
exports.initializeWallets = initializeWallets;
