import react, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import { Flex, Box, useColorMode, IconButton, Button } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { connectWallet, isConnected, getBalance } from '../../celo/utils';
import Link from 'next/link';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  const handleConnect = async () => {
    try {
      await connectWallet();
      setConnected(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(async () => {
    setConnected(isConnected());

    if (connected) {
      const balance = await getBalance();
      setBalance(balance);
    }
  }, [connected]);

  const renderBalance = () => {
    if (!connected) {
      return (
        <Button onClick={handleConnect} margin="0px 10px">
          Connect Wallet
        </Button>
      );
    }
    return <Button margin="0px 10px">{`cUSD ${balance}`}</Button>;
  };

  return (
    <Box boxShadow="base">
      <Flex
        className={styles.container}
        alignItems={'center'}
        justifyContent={'space-between'}>
        <Link href="/">
          <a>
            <Box>
              <object
                type="image/svg+xml"
                data="/celo-logo.svg"
                style={{
                  width: '70px',
                  height: '70px',
                  zIndex: -1,
                  position: 'relative',
                }}>
                svg-animation
              </object>
            </Box>
          </a>
        </Link>

        <Flex alignItems={'center'} justifyContent={'center'}>
          <a href="https://github.com/MarianoLazzos/celo-dapp-request">
            <IconButton m="10px">
              <svg
                style={{ padding: '8px' }}
                viewBox="0 0 20 20"
                focusable="false"
                className="chakra-icon css-x3x30j">
                <path
                  fill="currentColor"
                  d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"></path>
              </svg>
            </IconButton>
          </a>
          <IconButton aria-label="Toggle Mode" onClick={toggleColorMode}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </IconButton>
          {/* <Button onClick={handleConnect} margin="0px 10px">
            Connect Wallet
          </Button> */}
          {renderBalance()}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
