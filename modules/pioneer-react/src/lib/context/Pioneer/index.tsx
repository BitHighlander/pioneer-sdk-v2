/*
    Pioneer SDK

        A ultra-light bridge to the pioneer platform

              ,    .  ,   .           .
          *  / \_ *  / \_      .-.  *       *   /\'__        *
            /    \  /    \,   ( ₿ )     .    _/  /  \  *'.
       .   /\/\  /\/ :' __ \_   -           _^/  ^/    `--.
          /    \/  \  _/  \-'\      *    /.' ^_   \_   .'\  *
        /\  .-   `. \/     \ /==~=-=~=-=-;.  _/ \ -. `_/   \
       /  `-.__ ^   / .-'.--\ =-=~_=-=~=^/  _ `--./ .-'  `-
      /        `.  / /       `.~-^=-=~=^=.-'      '-._ `._

                             A Product of the CoinMasters Guild
                                              - Highlander

*/
import EventEmitter from "events";
// @ts-ignore
// import { SDK } from "../../../../../../modules/sdk/lib";
import { SDK } from "@pioneer-sdk/sdk-v3";

import {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";

import { v4 as uuidv4 } from "uuid";

const eventEmitter = new EventEmitter();

export enum WalletActions {
  SET_STATUS = "SET_STATUS",
  SET_USERNAME = "SET_USERNAME",
  OPEN_MODAL = "OPEN_MODAL",
  SET_API = "SET_API",
  SET_APP = "SET_APP",
  SET_WALLET = "SET_WALLET",
  SET_WALLET_DESCRIPTIONS = "SET_WALLET_DESCRIPTIONS",
  SET_CONTEXT = "SET_CONTEXT",
  SET_ASSET_CONTEXT = "SET_ASSET_CONTEXT",
  SET_BLOCKCHAIN_CONTEXT = "SET_BLOCKCHAIN_CONTEXT",
  SET_PUBKEY_CONTEXT = "SET_PUBKEY_CONTEXT",
  ADD_WALLET = "ADD_WALLET",
  RESET_STATE = "RESET_STATE",
}

export interface InitialState {
  // keyring: Keyring;
  status: any;
  username: string;
  serviceKey: string;
  queryKey: string;
  context: string;
  assetContext: string;
  blockchainContext: string;
  pubkeyContext: string;
  walletDescriptions: any[];
  totalValueUsd: number;
  app: any;
  api: any;
}

const initialState: InitialState = {
  status: "disconnected",
  username: "",
  serviceKey: "",
  queryKey: "",
  context: "",
  assetContext: "",
  blockchainContext: "",
  pubkeyContext: "",
  walletDescriptions: [],
  totalValueUsd: 0,
  app: null,
  api: null,
};

export interface IPioneerContext {
  state: InitialState;
  username: string | null;
  context: string | null;
  status: string | null;
  totalValueUsd: number | null;
  assetContext: string | null;
  blockchainContext: string | null;
  pubkeyContext: string | null;
  app: any;
  api: any;
}

export type ActionTypes =
  | { type: WalletActions.SET_STATUS; payload: any }
  | { type: WalletActions.SET_USERNAME; payload: string }
  | { type: WalletActions.OPEN_MODAL; payload: string }
  | { type: WalletActions.SET_APP; payload: any }
  | { type: WalletActions.SET_API; payload: any }
  | { type: WalletActions.SET_CONTEXT; payload: any }
  | { type: WalletActions.SET_ASSET_CONTEXT; payload: any }
  | { type: WalletActions.SET_BLOCKCHAIN_CONTEXT; payload: any }
  | { type: WalletActions.SET_PUBKEY_CONTEXT; payload: any }
  | { type: WalletActions.ADD_WALLET; payload: any }
  | { type: WalletActions.RESET_STATE };

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_STATUS:
      eventEmitter.emit("SET_STATUS", action.payload);
      return { ...state, status: action.payload };
    case WalletActions.SET_CONTEXT:
      //eventEmitter.emit("SET_CONTEXT", action.payload);
      return { ...state, context: action.payload };
    case WalletActions.SET_ASSET_CONTEXT:
      //eventEmitter.emit("SET_ASSET_CONTEXT", action.payload);
      return { ...state, assetContext: action.payload };
    case WalletActions.SET_BLOCKCHAIN_CONTEXT:
      //eventEmitter.emit("SET_BLOCKCHAIN_CONTEXT", action.payload);
      return { ...state, blockchainContext: action.payload };
    case WalletActions.SET_PUBKEY_CONTEXT:
      //eventEmitter.emit("SET_PUBKEY_CONTEXT", action.payload);
      return { ...state, pubkeyContext: action.payload };
    case WalletActions.SET_USERNAME:
      //eventEmitter.emit("SET_USERNAME", action.payload);
      return { ...state, username: action.payload };
    case WalletActions.OPEN_MODAL:
      return { ...state, payload: action.payload };
    case WalletActions.SET_APP:
      return { ...state, app: action.payload };
    case WalletActions.SET_API:
      return { ...state, api: action.payload };
    case WalletActions.RESET_STATE:
      return {
        ...state,
        api: null,
        user: null,
        username: null,
        context: null,
        status: null,
      };
    default:
      return state;
  }
};

const PioneerContext = createContext(initialState);

export const PioneerProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (message: string) => {
    console.log("OPEN MODAL: modal: ", message);
    setIsModalOpen(true);
    // Optional: You can also set a message to be displayed in the modal
  };

  const hideModal = () => {
    setIsModalOpen(false);
  };

  //TODO add wallet to state
  const connectWallet = async function (wallet: string) {
    try {
      console.log("connectWallet: ", wallet);
      const successKeepKey = await state.app.pairWallet(wallet);
      console.log("successKeepKey: ", successKeepKey);
      console.log("state.app.assetContext: ", state.app.assetContext);
      console.log("state.app.blockchainContext: ", state.app.blockchainContext);
      console.log("state.app.context: ", state.app.context);
      if(state && state.app){
        dispatch({ type: WalletActions.SET_CONTEXT, payload: state.app.context });
        dispatch({ type: WalletActions.SET_ASSET_CONTEXT, payload: state.app.assetContext });
        dispatch({ type: WalletActions.SET_BLOCKCHAIN_CONTEXT, payload: state.app.blockchainContext });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onStart = async function () {
    try {
      const serviceKey: string | null = localStorage.getItem("serviceKey"); // KeepKey api key
      let queryKey: string | null = localStorage.getItem("queryKey");
      let username: string | null = localStorage.getItem("username");
      //@ts-ignore
      dispatch({ type: WalletActions.SET_USERNAME, payload: username });


      //TODO why dis no worky
      //if keepkey available, connect
      connectWallet("KEEPKEY");

      //if auto connecting
      const isOnboarded = localStorage.getItem("userOnboarded");
      console.log("isOnboarded: ", isOnboarded);

      if (!queryKey) {
        queryKey = `key:${uuidv4()}`;
        localStorage.setItem("queryKey", queryKey);
      }
      if (!username) {
        username = `user:${uuidv4()}`;
        username = username.substring(0, 13);
        localStorage.setItem("username", username);
      }
      const blockchains = [
        "bitcoin",
        "ethereum",
        "thorchain",
        "bitcoincash",
        "litecoin",
        "binance",
        "cosmos",
        "dogecoin",
      ];

      // @TODO add custom paths from localstorage
      const paths: any = [];
      console.log("VITE_PIONEER_URL_SPEC: ");
      const spec =
        //@ts-ignore
        "https://pioneers.dev/spec/swagger.json";
      //@ts-ignore
      console.log("spec: ", spec);
      const wss = "wss://pioneers.dev";
      const configPioneer: any = {
        blockchains,
        username,
        queryKey,
        spec,
        wss,
        paths,
      };
      const appInit = new SDK(spec, configPioneer);
      // @ts-ignore
      const api = await appInit.init();

      //set wallets to available wallets
      // @ts-ignore
      console.log("appInit.wallets: ", appInit.wallets);
      // @ts-ignore
      dispatch({ type: WalletActions.SET_API, payload: api });
      // @ts-ignore
      dispatch({ type: WalletActions.SET_APP, payload: appInit });


      //@TODO if any wallet been connected before connect
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  // onstart get data
  useEffect(() => {
    showModal("foo");
    onStart();
  }, []);

  useEffect(() => {
    if(state && state.app){
      dispatch({ type: WalletActions.SET_ASSET_CONTEXT, payload: state.app.assetContext });
      dispatch({ type: WalletActions.SET_BLOCKCHAIN_CONTEXT, payload: state.app.blockchainContext });
      dispatch({ type: WalletActions.SET_CONTEXT, payload: state.app.context });
    }
  }, [state?.app, state?.app?.context, state?.app?.assetContext, state?.app?.blockchainContext]);

  // end
  const value: any = useMemo(
    () => ({ state, dispatch, connectWallet }),
    [state]
  );

  return (
    <PioneerContext.Provider value={value}>{children}</PioneerContext.Provider>
  );
};

type ModalProps = {
  onClose: () => void;
};

export const usePioneer = (): any =>
  useContext(PioneerContext as unknown as React.Context<IPioneerContext>);
