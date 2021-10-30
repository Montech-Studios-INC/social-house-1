import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import theme from "../../styles/ChakraTheme";
import Layout from "./Layout";
import ConnectButton from "./ConnectButton";
import AccountModal from "./AccountModal";
import "@fontsource/inter";

function App() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
      <ChakraProvider>
          <ConnectButton handleOpenModal={onOpen} />
          <AccountModal isOpen={isOpen} onClose={onClose} />
      </ChakraProvider>
    );
  }
  
  export default App;