// index.tsx
import { ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import ReactDOM from "react-dom/client";
// fonts
import "@fontsource/plus-jakarta-sans/latin.css";

import Pioneer from "./lib/components/Pioneer";
import { PioneerProvider, usePioneer } from "./lib/context/Pioneer";
import { theme } from "./lib/styles/theme";
import Balances from "./lib/components/pioneer/Pioneer/Balances";
import Pubkeys from "./lib/components/Pubkeys";
import Paths from "./lib/components/Paths";
import Swap from "./lib/components/Swap";
import Portfolio from "./lib/components/Portfolio";
import Pending from "./lib/components/Pending";
import Transfer from "./lib/components/Transfer";
import Track from "./lib/components/Track";
import AssetSelect from "./lib/components/AssetSelect";
import WalletSelect from "./lib/components/WalletSelect";
import BlockchainSelect from "./lib/components/AssetSelect";
import MiddleEllipsis from "./lib/components/MiddleEllipsis";

// import App from "./App";

// To publish comment, to run as dev, uncomment

// const root = ReactDOM.createRoot(
//   document.getElementById("root") as HTMLElement
// );
// root.render(
//   <>
//     <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
//     <App />
//   </>
// );

//end dev mode

//types
export interface PioneerType {
    test: string;
    foo: string;
    bar: boolean;
}

export {
  Pioneer,
  PioneerProvider,
  usePioneer,
  Balances,
  BlockchainSelect,
  WalletSelect,
  AssetSelect,
  MiddleEllipsis,
  Pubkeys,
  Paths,
  Swap,
  Portfolio,
  Pending,
  Transfer,
  Track,
};
