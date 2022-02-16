import react, { useEffect, useState } from 'react';
import {
  Wrap,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Box,
  Button,
  WrapItem,
  Heading,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import {
  createRequestsInstances,
  getAccounts,
  approve,
  contribute,
  getBalanceOf,
  isConnected,
} from '../../../celo/utils';
import BigNumber from 'bignumber.js';
import Head from 'next/head';

const AddressIndex = () => {
  const router = useRouter();
  const { query } = router;
  const [contract, setContract] = useState();
  const [contractInfo, setContractInfo] = useState();
  const [contributions, setContributions] = useState([]);
  const [contributionsLength, setContributionsLength] = useState(0);
  const [accounts, setAccounts] = useState();
  const [balance, setBalance] = useState(0);
  const [submiting, setSubmiting] = useState(false);
  const [formValue, setFormValue] = useState({ message: ' ' });
  const [connected, setConnected] = useState(null);
  const [ended, setEnded] = useState(false);
  const [showError, setShowError] = useState({
    show: false,
    message: '',
    type: '',
  });
  const [error, setError] = useState({
    isFormValid: true,
    errors: {
      amount: false,
      message: false,
    },
  });

  const ERC20_DECIMALS = 18;

  useEffect(async () => {
    if (query.address) {
      const ri = await createRequestsInstances([query.address]);
      const ac = await getAccounts();
      setContract(ri[0]);
      setAccounts(ac);
      await getAllContributions(ri[0]);
      await contractBalance(query.address);
      await setContribLenght(ri[0]);
      await getContractInfo(ri[0]);
    }
  }, [query]);

  const setContribLenght = async (c) => {
    try {
      const cl = await c.methods.getContributionsLength().call();
      setContributionsLength(cl);
    } catch (err) {}
  };

  const getAllContributions = async (ctr) => {
    const contrib = await Promise.all(
      Array(contributionsLength)
        .fill()
        .map((element, index) => {
          return new Promise(async (resolve, reject) => {
            let c = await ctr.methods.getContributions(index).call();
            resolve({
              contributor: c[0],
              message: c[1],
              amount: c[2],
            });
          });
        })
    );
    setContributions(contrib);
  };

  const handleContributionSubmit = async () => {
    setConnected(isConnected());
    if (connected) return;

    setSubmiting(true);
    if (validateContribution()) {
      try {
        console.log('Approving...');
        const price = new BigNumber(formValue.amount)
          .shiftedBy(ERC20_DECIMALS)
          .toString();

        await approve(price, query.address);
        console.log('Approved');
      } catch (err) {
        console.log('Approve Error');
        setShowError({ show: true, message: 'Approve Failed.', type: 'error' });
        setSubmiting(false);
        return;
      }

      try {
        console.log('Transfering...');
        const price = new BigNumber(formValue.amount)
          .shiftedBy(ERC20_DECIMALS)
          .toString();

        await contribute(contract, formValue.message, price);
        console.log('Succesfully transfered');
        setShowError({
          show: true,
          message: 'Succesfully transfered',
          type: 'success',
        });
      } catch (err) {
        console.log('Transfer Failed');
        setShowError({ show: true, message: 'Transfer Failed', type: 'error' });
      }
    }

    setSubmiting(false);
  };

  const contractBalance = async (adrs) => {
    const b = await getBalanceOf(adrs);
    setBalance(b);
  };

  const getContractInfo = async (contr) => {
    const res = await contr.methods.getInfo().call();
    const ci = {
      name: res[0],
      description: res[2],
      owner: res[4],
      requestEnded: res[5],
    };
    setContractInfo(ci);
  };

  const handleFinishRequest = async () => {
    setEnded(true);
    try {
      await contract.methods.finishRequest().send({ from: accounts[0] });
      await getContractInfo(contract);
    } catch (err) {}
    setEnded(false);
  };

  const renderEnded = () => {
    if (accounts) {
      if (contractInfo.owner === accounts[0] && !contractInfo.requestEnded) {
        return (
          <Button
            isLoading={ended}
            onClick={handleFinishRequest}
            bg="green.400">
            Finish Request
          </Button>
        );
      }
    }
  };

  const renderContractInfo = () => {
    if (contractInfo) {
      return (
        <Box mb="10" mt="4">
          <Flex align="center" justify="space-between">
            <Flex direction="column">
              <Heading>{contractInfo.name}</Heading>
              <Heading size="md">
                Description: {contractInfo.description}
              </Heading>
            </Flex>
            <Flex direction="column">
              <Box
                boxShadow="lg"
                p="3"
                borderRadius="lg"
                bg="whiteAlpha.100"
                mb="3">
                {`Money Raised: cUSD ${balance}`}
              </Box>
              {renderEnded()}
            </Flex>
          </Flex>
        </Box>
      );
    }

    return <Box>Loading...</Box>;
  };

  const renderContributions = () => {
    if (contributions.length !== 0) {
      return contributions.map((contrib, index) => {
        return (
          <WrapItem bg="whiteAlpha.100" borderRadius="lg" boxShadow="lg">
            <Box m="2">
              <Box>Contributor: {contrib.contributor}</Box>
              <Box>{contrib.message}</Box>
              <Box>
                {`cUSD: ${BigNumber(contrib.amount)
                  .shiftedBy(-ERC20_DECIMALS)
                  .toFixed(3)}`}
              </Box>
            </Box>
          </WrapItem>
        );
      });
    }

    return (
      <Box
        borderRadius="lg"
        bg="whiteAlpha.100"
        p="2"
        textAlign="center"
        boxShadow="lg">
        No contributions yet, Be the first!
      </Box>
    );
  };

  const validateContribution = () => {
    let errores = {
      isFormValid: true,
      errors: {
        amount: false,
      },
    };

    if (!/^\d+(\.\d+)*$/.test(formValue.amount)) {
      errores.errors.amount = true;
    }

    if (formValue.amount <= 0) {
      errores.errors.amount = true;
    }

    if (!formValue.amount || formValue.amount === '') {
      errores.errors.amount = true;
    }

    Object.entries(errores.errors).forEach((err) => {
      if (err[1]) {
        errores.isFormValid = false;
      }
    });
    setError(errores);
    return errores.isFormValid;
  };

  return (
    <Box className="container">
      <Head>
        <title>Contribute</title>
      </Head>
      {showError.show && (
        <Alert status={showError.type} variant="subtle">
          <AlertIcon />
          {showError.message}
        </Alert>
      )}
      {renderContractInfo()}
      <Heading mb="3">List of Contributions</Heading>
      <Wrap w="100%" align="flex-start">
        <Wrap flex="1" direction="column">
          {renderContributions()}
        </Wrap>
        <Flex direction="column">
          {connected === false ? (
            <Alert status="warning">
              <AlertIcon />
              You need to connect your wallet
            </Alert>
          ) : (
            <></>
          )}
          <FormControl isRequired isInvalid={error.errors.amount}>
            <FormLabel>Amount</FormLabel>
            <InputGroup>
              <InputLeftAddon children="cUSD" />
              <Input
                value={formValue.amount}
                onChange={(e) =>
                  setFormValue({ ...formValue, amount: e.target.value })
                }
                placeholder="amount"
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Message</FormLabel>
            <Input
              value={formValue.message}
              onChange={(e) =>
                setFormValue({ ...formValue, message: e.target.value })
              }
              placeholder="message"
            />
          </FormControl>
          <Button
            isLoading={submiting}
            mt="2"
            onClick={handleContributionSubmit}>
            Submit
          </Button>
        </Flex>
      </Wrap>
    </Box>
  );
};

export default AddressIndex;
