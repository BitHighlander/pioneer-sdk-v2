import {
  Button,
  Grid,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  Input,
  Spinner,
  Box,
  Avatar,
  Card
} from "@chakra-ui/react";
import { Chain } from "@pioneer-platform/types";
import { usePioneer } from "lib/context/Pioneer";
import React, { useState, useCallback } from "react";
import {
  Amount,
  AmountType,
  AssetAmount,
} from "@pioneer-platform/swapkit-entities";

const Transfer = ({ openModal }) => {
  const { state } = usePioneer();
  const {
    api,
    app,
    context,
    assetContext,
    blockchainContext,
    pubkeyContext,
    modals,
    balances,
  } = state;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [sendAmount, setSendAmount] = useState<Amount | undefined>();
  const [recipient, setRecipient] = useState("");

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    if (!assetContext) return;
    const float = parseFloat(value);
    const amount = new Amount(
      float,
      AmountType.ASSET_AMOUNT,
      assetContext.asset.decimal
    );
    setSendAmount(amount);
  };

  const handleSend = useCallback(async () => {
    if (!assetContext || !inputAmount || !app || !app.swapKit || !sendAmount)
      return;
    const assetAmount = new AssetAmount(assetContext.asset, sendAmount);

    console.log("recipient: ", recipient);
    if (!recipient) alert("Must select a recipient");

    const txHash = await app.swapKit.transfer({
      assetAmount,
      memo: "",
      recipient,
    });

    window.open(
      `${app.swapKit.getExplorerTxUrl(Chain.THORChain, txHash as string)}`,
      "_blank"
    );
  }, [assetContext, inputAmount, app, app?.swapKit, recipient, sendAmount]);

  return (
    <div>
      <Card border="thin" borderColor="white" borderRadius="md" p={5}>
        <Heading as="h1" size="lg">
          Send Crypto!
        </Heading>
        {/*<Text>Asset: {JSON.stringify(assetContext)}</Text>*/}
        <Text>Asset: {assetContext && assetContext?.asset?.name}</Text>
        <Text>chain: {assetContext && assetContext?.asset?.chain}</Text>
        <Text>symbol: {assetContext && assetContext?.asset?.symbol}</Text>
        <Button
          mb={4}
          onClick={() => openModal("Select Asset")}
          isDisabled={!balances}
        >
          Select Asset
        </Button>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <div>
            <span>Recipient:</span>
            <input
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="address"
              value={recipient}
            />
          </div>

          <div>
            <span>Input Amount:</span>
            <input
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0.0"
              value={inputAmount}
            />
          </div>
          <Text>
            Available Balance:{" "}
            {assetContext && assetContext?.assetAmount?.toString()} (
            {assetContext && assetContext?.asset?.symbol})
          </Text>
          {/*<Button>Send Max</Button>*/}
        </Grid>

        <Button mt={4} isLoading={isSubmitting} onClick={handleSend}>
          {isSubmitting ? <Spinner size="xs" /> : "Send"}
        </Button>
      </Card>
    </div>
  );
};

export default Transfer;
