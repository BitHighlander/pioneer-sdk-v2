import { Box, Flex } from '@chakra-ui/react';

// @ts-ignore
import Pioneer from '../components/Pioneer';

const Header = () => {
  return (
      <Flex
          as="header"
          width="full"
          align="center"
          alignSelf="flex-start"
          justifyContent="center"
          gridGap={2}
      >
        <Box marginLeft="auto">
          <Pioneer />
        </Box>
      </Flex>
  );
};

export default Header;
