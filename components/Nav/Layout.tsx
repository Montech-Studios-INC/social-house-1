import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

type Props = {
  children?: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <Flex
    
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="10"
      w="20"
      bg="red.500"
    >
      {children}
    </Flex>
  )
}