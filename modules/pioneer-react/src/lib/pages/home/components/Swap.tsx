import {
  Button,
  Grid,
  Heading,
  Text,
  Input,
  Spinner,
  VStack,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  Box,
  Avatar,
  HStack,
  Progress,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { QuoteRoute, SwapKitApi } from "@pioneer-platform/swapkit-api";
import { Chain } from "@pioneer-platform/types";
import { SettingsIcon, ArrowUpDownIcon, AddIcon } from "@chakra-ui/icons";
import { usePioneer } from "lib/context/Pioneer";
import { FeeOption } from "@pioneer-platform/types";
import React, { useState, useCallback } from "react";
import {
  Amount,
  AmountType,
  AssetAmount,
} from "@pioneer-platform/swapkit-entities";

const Swap = ({ openModal }) => {
  const toast = useToast();
  const { state } = usePioneer();
  const {
    api,
    app,
    context,
    assetContext,
    blockchainContext,
    outboundAssetContext,
    pubkeyContext,
    modals,
    balances,
  } = state;
  const [assetsSelected, setAssetsSelected] = useState(false);
  const [buttonText, setButtonText] = useState("Continue");
  const [loading, setLoading] = useState(false);
  const [inputAmount, setInputAmount] = useState<Amount | undefined>();
  const [amount, setAmount] = useState(0);
  const [routes, setRoutes] = useState<QuoteRoute[]>([]);
  // const [output, setOutput] = useState(null);

  const switchAssets = function () {
    console.log("Switching assets!");
    // const inputNew = output;
    // const outputNew = assetContext;
    // setInput(inputNew);
    // setOutput(outputNew);
  };
  const onContinue = async function () {
    try {
      //Next show the amount input
      setAssetsSelected(true);
      setButtonText("Swap");
      if (assetsSelected) {
        fetchQuote();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuote = useCallback(async () => {
    console.log("fetchQuote: ", fetchQuote);
    if (!assetContext || !outboundAssetContext || !app || !app.swapKit)
      alert("unable to get quote! app in poor state!");
    setLoading(true);
    setRoutes([]);

    const amountSelect = parseFloat(String(amount));
    console.log("amountSelect: ", amountSelect);
    const amountSelectAsset = Amount.fromNormalAmount(amountSelect);
    setInputAmount(amountSelectAsset);
    const senderAddress = app.swapKit.getAddress(assetContext.asset.L1Chain);
    const recipientAddress = app.swapKit.getAddress(
      outboundAssetContext.asset.L1Chain
    );
    console.log("assetContext: ", assetContext);
    console.log("outboundAssetContext: ", outboundAssetContext);

    try {
      const entry = {
        sellAsset: assetContext.asset.toString(),
        sellAmount: amountSelectAsset.assetAmount.toString(),
        buyAsset: outboundAssetContext.asset.toString(),
        senderAddress,
        recipientAddress,
        slippage: "3",
      };
      console.log("entry: ", entry);
      const { routes } = await SwapKitApi.getQuote({
        sellAsset: assetContext.asset.toString(),
        sellAmount: inputAmount.assetAmount.toString(),
        buyAsset: outboundAssetContext.asset.toString(),
        senderAddress,
        recipientAddress,
        slippage: "3",
      });
      console.log("routes: ", routes);
      setRoutes(routes || []);
    } catch (e) {
      console.error("ERROR: ", e);
      alert("Failed to get quote! " + e.message);
      setLoading(false);
    }
  }, [inputAmount, assetContext, outboundAssetContext, app, app?.swapKit]);

  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = assetContext?.asset.L1Chain;
      const outputChain = outboundAssetContext?.asset.L1Chain;
      if (!assetContext || !outboundAssetContext || !app || !app?.swapKit)
        return;

      const address = app?.swapKit.getAddress(outputChain);

      const txHash = await app?.swapKit.swap({
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(
        app?.swapKit.getExplorerTxUrl(inputChain, txHash as string),
        "_blank"
      );
    },
    [
      assetContext?.asset.L1Chain,
      outboundAssetContext?.asset.L1Chain,
      app?.swapKit,
    ]
  );

  return (
    <VStack spacing={5} align="start" p={6} borderRadius="md">
      {assetsSelected ? (
        <div>
          <div>
            <span>Input Amount:</span>
            <Text>Asset: {assetContext?.asset?.name || "N/A"}</Text>
            <Text>Chain: {assetContext?.asset?.chain || "N/A"}</Text>
            <Text>Symbol: {assetContext?.asset?.symbol || "N/A"}</Text>
            <input
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              placeholder="0.0"
              type="number"
              value={amount}
            />
          </div>
          <Text>
            Amount Available: {assetContext?.assetAmount.toString()} (
            {assetContext?.asset?.symbol})
          </Text>
          {routes &&
            routes.length > 0 &&
            routes.map((route, index) => (
              <Card key={index} mb={5}>
                <CardHeader>
                  <Heading size="md">Route: {route.path || "N/A"}</Heading>
                </CardHeader>

                <CardBody>
                  <Stack divider={<StackDivider />} spacing="4">
                    {/* Expected Output */}
                    {route.expectedOutput && (
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Expected Output
                        </Heading>
                        <Text>{route.expectedOutput}</Text>
                      </Box>
                    )}

                    {/* Fees */}
                    {route.fees && route.fees.THOR && (
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Fees
                        </Heading>
                        {route.fees.THOR.map((fee, feeIndex) => (
                          <Text key={feeIndex}>
                            Type: {fee.type}, Asset: {fee.asset}, Total Fee:{" "}
                            {fee.totalFeeUSD} USD
                          </Text>
                        ))}
                      </Box>
                    )}

                    {/* Meta */}
                    {route.meta && (
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Meta
                        </Heading>
                        <Text>Sell Chain: {route.meta.sellChain}</Text>
                        <Text>Buy Chain: {route.meta.buyChain}</Text>
                        <Text>
                          Price Protection Required:{" "}
                          {route.meta.priceProtectionRequired ? "Yes" : "No"}
                        </Text>
                        <Text>Quote Mode: {route.meta.quoteMode}</Text>
                      </Box>
                    )}

                    {/* Transaction */}
                    {route.transaction && route.transaction.inputs && (
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Transaction
                        </Heading>
                        <TableContainer>
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Hash</Th>
                                <Th>Value</Th>
                                <Th>Address</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {route.transaction.inputs.map(
                                (input, inputIndex) => (
                                  <Tr key={inputIndex}>
                                    <Td>{input.hash}</Td>
                                    <Td>{input.value}</Td>
                                    <Td>{input.address}</Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                        <Button onClick={() => handleSwap(route)}>
                          Select Route
                        </Button>
                      </Box>
                    )}

                    {/* Warnings */}
                    {route.warnings && (
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Warnings
                        </Heading>
                        {route?.warnings?.map((warning, warningIndex) => (
                          <Text key={warningIndex}>
                            {warning.warningMessage}
                          </Text>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            ))}
          <button
            disabled={!assetContext || !outboundAssetContext}
            onClick={fetchQuote}
            type="button"
          >
            {loading ? "Loading..." : "Get Quote"}
          </button>
        </div>
      ) : (
        <div>
          Select Assets
          <br />
          <Flex
            mx="auto"
            alignItems="center"
            justifyContent="center"
            bg="black"
            p="2rem"
          >
            <HStack
              spacing={4} // Adjust the spacing between the two boxes
              maxWidth="35rem" // Set maximum width for the container
              width="100%" // Ensure the container takes full width
            >
              <Box
                flex="1" // Adjust the flex property to control the width
                h="10rem"
                border="1px solid #fff"
                borderRadius="8px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                _hover={{ color: "rgb(128,128,128)" }}
                onClick={() => openModal("Select Asset")}
              >
                {!assetContext ? (
                  <Spinner size="lg" color="blue.500" />
                ) : (
                  <>
                    {/*<Avatar size="xl" src={assetContext.image} />*/}
                    <Box
                      border="1px solid #fff"
                      borderRadius="8px"
                      width="100%"
                    >
                      <Text>Network: {assetContext.asset.network}</Text>
                    </Box>
                    <Box
                      border="1px solid #fff"
                      borderRadius="8px"
                      width="100%"
                    >
                      <Text>Asset: {assetContext.asset.symbol}</Text>
                    </Box>
                  </>
                )}
              </Box>
              <ArrowUpDownIcon
                onClick={() => switchAssets()}
                color="white"
                boxSize="2rem"
              />
              <Box
                flex="1" // Adjust the flex property to control the width
                h="10rem"
                border="1px solid #fff"
                borderRadius="8px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                _hover={{ color: "rgb(128,128,128)" }}
                onClick={() => openModal("Select Outbound")}
              >
                {!outboundAssetContext ? (
                  <Spinner size="lg" color="blue.500" />
                ) : (
                  <div>
                    {/*<Avatar size="xl" src={outboundAssetContext.image} />*/}
                    <Box
                      border="1px solid #fff"
                      borderRadius="8px"
                      width="100%"
                    >
                      <Text>Network: {outboundAssetContext.asset.network}</Text>
                    </Box>
                    <Box
                      border="1px solid #fff"
                      borderRadius="8px"
                      width="100%"
                    >
                      <Text>Asset: {outboundAssetContext.asset.symbol}</Text>
                    </Box>
                  </div>
                )}
              </Box>
            </HStack>
          </Flex>
        </div>
      )}
      <Button onClick={onContinue}>{buttonText}</Button>
    </VStack>
  );
};

export default Swap;
