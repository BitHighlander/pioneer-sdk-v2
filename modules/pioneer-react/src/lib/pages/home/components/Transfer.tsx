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
} from "@chakra-ui/react";
import { usePioneer } from "lib/context/Pioneer";
import React, { useState } from "react";

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
  } = state;
  const [address, setAddress] = useState("");
  const [modalType, setModalType] = useState("");
  return (
    <div>
      <p>
        <h1>Send Crypto!</h1>
      </p>
      <br />
      Asset {assetContext?.name}
      <br />
      <Button onClick={() => openModal("Select Asset")}>Select Asset</Button>
      <br />
      amount:
    </div>
  );
};

export default Transfer;
