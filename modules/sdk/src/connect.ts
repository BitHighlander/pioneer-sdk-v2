const TAG = " | connectWallets | "
import { Chain, EVMChainList, WalletOption } from '@pioneer-platform/types';
import { availableChainsByWallet } from "./support";
export async function initializeWallets() {
    let tag = TAG + " | initializeWallets | "
    const wallets:any = [];
    const walletsVerbose:any = [];

    // Importing wallets
    const { keepkeyWallet } = await import('@pioneer-platform/keepkey');
    const { evmWallet } = await import('@pioneer-platform/evm-web3-wallets');
    const { keplrWallet } = await import('@pioneer-platform/keplr');
    const { keystoreWallet } = await import('@pioneer-platform/keystore');
    const { metamaskWallet } = await import('@pioneer-platform/metamask');
    const { ledgerWallet } = await import('@pioneer-platform/ledger');
    const { okxWallet } = await import('@pioneer-platform/okx');
    const { trezorWallet } = await import('@pioneer-platform/trezor');
    const { walletconnectWallet } = await import('@pioneer-platform/walletconnect');
    const { xdefiWallet } = await import('@pioneer-platform/xdefi');

    // Initialize and push each wallet into the wallets array
    let walletKeepKey = {
        type: WalletOption.KEEPKEY,
        icon: 'https://pioneers.dev/coins/keepkey.png',
        chains: availableChainsByWallet[WalletOption.KEEPKEY],
        wallet: keepkeyWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(keepkeyWallet)
    walletsVerbose.push(walletKeepKey)
    let walletMetaMask = {
        type: WalletOption.METAMASK,
        icon: 'https://pioneers.dev/coins/metamask.png',
        chains: availableChainsByWallet[WalletOption.METAMASK],
        wallet: metamaskWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(metamaskWallet)
    walletsVerbose.push(walletMetaMask)
    let walletEVM = {
        type:  'EVM', //TODO
        icon: 'https://pioneers.dev/coins/evm.png',
        chains: availableChainsByWallet['EVM'], //TODO
        wallet: evmWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(evmWallet)
    walletsVerbose.push(walletEVM)
    let walletKeplr = {
        type:  WalletOption.KEPLR,
        icon: 'https://pioneers.dev/coins/keplr.png',
        chains: availableChainsByWallet[WalletOption.KEPLR],
        wallet: keplrWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(keplrWallet)
    walletsVerbose.push(walletKeplr)
    let walletKeystore = {
        type:  WalletOption.KEYSTORE,
        icon: 'https://pioneers.dev/coins/keystore.png',
        chains: availableChainsByWallet[WalletOption.KEYSTORE],
        wallet: keystoreWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(keystoreWallet)
    walletsVerbose.push(walletKeystore)
    let walletLedger = {
        type:  WalletOption.LEDGER,
        icon: 'https://pioneers.dev/coins/ledger.png',
        chains: availableChainsByWallet[WalletOption.LEDGER],
        wallet: ledgerWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(ledgerWallet)
    walletsVerbose.push(walletLedger)
    let walletOKX = {
        type:  WalletOption.OKX,
        icon: 'https://pioneers.dev/coins/okx.png',
        chains: availableChainsByWallet[WalletOption.OKX],
        wallet: okxWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(okxWallet)
    walletsVerbose.push(walletOKX)
    let walletTrezor = {
        type:  WalletOption.TREZOR,
        icon: 'https://pioneers.dev/coins/trezor.png',
        chains: availableChainsByWallet[WalletOption.TREZOR],
        wallet: trezorWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(trezorWallet)
    walletsVerbose.push(walletTrezor)
    let walletWalletConnect = {
        type:  WalletOption.WALLETCONNECT,
        icon: 'https://pioneers.dev/coins/walletconnect.png',
        chains: availableChainsByWallet[WalletOption.WALLETCONNECT],
        wallet: walletconnectWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(walletconnectWallet)
    walletsVerbose.push(walletWalletConnect)
    let walletXDefi = {
        type:  WalletOption.XDEFI,
        icon: 'https://pioneers.dev/coins/xdefi.png',
        chains: availableChainsByWallet[WalletOption.XDEFI],
        wallet: xdefiWallet,
        status: 'offline',
        isConnected: false
    }
    wallets.push(xdefiWallet)
    walletsVerbose.push(walletXDefi)

    //TODO test each for detection

    return {wallets,walletsVerbose};
}
