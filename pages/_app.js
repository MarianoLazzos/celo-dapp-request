import '../styles/globals.css';
import '@fontsource/nunito/200.css';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './_theme';
import Navbar from '../components/Navbar/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Navbar />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
