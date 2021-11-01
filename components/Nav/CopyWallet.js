import {
    Box,
    Button,
    Flex,
    Link,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Text,
  } from "@chakra-ui/react";
  import {useState} from 'react'
  import { ExternalLinkIcon, CopyIcon } from "@chakra-ui/icons";
  import { Tooltip } from 'antd';
  import {CopyToClipboard} from 'react-copy-to-clipboard';

  
  export default function CopyWallet({ value }) {
    const [toolTip, setToolTip] = useState('Copy')
  
    return (<Button
                  variant="link"
                  color="gray.400"
                  fontWeight="normal"
                  fontSize="sm"
                  _hover={{
                    textDecoration: "none",
                    color: "gray.600",
                  }}
                >
                  <CopyToClipboard text={value}
                    onCopy={() => setToolTip('copied')}>
                    <Tooltip placement="top" title={toolTip}>
                    <CopyIcon mr={1} />
                    Copy Address
                    </Tooltip>
                  </CopyToClipboard>
               
                </Button>
    );
  }