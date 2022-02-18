import react, { useEffect, useState } from 'react';
import RequestCard from '../../components/RequestCard/RequestCard';
import {
  Wrap,
  Heading,
  Box,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Alert,
  AlertIcon,
  InputRightAddon,
  InputGroup,
} from '@chakra-ui/react';
import {
  getAccounts,
  createFactoryInstance,
  fetchAllRequests,
  createRequestsInstances,
  isConnected,
} from '../../celo/utils';
import { AddIcon } from '@chakra-ui/icons';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Requests = () => {
  const [factory, setFactory] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [requestsAddress, setRequestsAddress] = useState([]);
  const [requestsContracts, setRequestsContracts] = useState([]);
  const [contractInfo, setContractInfo] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formValue, setFormValue] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState({
    isFormValid: true,
    errors: {
      title: false,
      url: false,
      description: false,
      goal: false,
    },
  });

  const router = useRouter();

  useEffect(async () => {
    const fc = await createFactoryInstance();
    const ac = await getAccounts();
    const rq = await fetchAllRequests();
    const res = await createRequestsInstances(rq);

    setFactory(fc);
    setAccounts(ac);
    setRequestsAddress(rq);
    setRequestsContracts(res);
    setConnected(isConnected());
  }, []);

  useEffect(async () => {
    await fetchRequestData();
  }, [requestsContracts]);

  useEffect(() => {
    if (window) {
      setConnected(isConnected());
    }
  });

  const handleCreateRequest = async (title, url = '', description, goal) => {
    setSubmitting(true);
    console.log(title, url, description, goal);
    console.log(accounts[0]);
    try {
      await factory.methods
        .createRequest(
          title,
          url,
          description,
          new BigNumber(goal).shiftedBy(18)
        )
        .send({ from: accounts[0] });
      onClose();
      const rq = await fetchAllRequests();
      console.log(rq);
      const res = await createRequestsInstances(rq);
      setRequestsAddress(rq);
      setRequestsContracts(res);
    } catch (err) {
      console.log(err);
    }
    setSubmitting(false);
  };

  const fetchRequestData = async () => {
    if (requestsContracts) {
      const requests = await Promise.all(
        Array(requestsContracts.length)
          .fill()
          .map((element, index) => {
            return new Promise(async (resolve, reject) => {
              let r = await requestsContracts[index].methods.getInfo().call();
              resolve({
                address: requestsAddress[index],
                name: r[0],
                image: r[1],
                description: r[2],
                goal: new BigNumber(r[3]),
                owner: r[4],
                requestEnded: r[5],
              });
            });
          })
      );

      setContractInfo(requests);
    }
  };

  const renderRequests = () => {
    return contractInfo.map((element, index) => {
      return <RequestCard data={element} />;
    });
  };

  const handleModalClick = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      await handleCreateRequest(
        formValue.title,
        formValue.url,
        formValue.description,
        formValue.goal
      );
    } catch (err) {
      console.log('err1');
    } finally {
    }
    setSubmitting(false);
  };

  const validateForm = () => {
    let errores = {
      isFormValid: true,
      errors: {
        title: false,
        url: false,
        description: false,
        goal: false,
      },
    };

    if (formValue.title.length > 30) {
      errores.errors.title = true;
    }
    if (!formValue.title || formValue.title === '') {
      errores.errors.title = true;
    }

    // if (!formValue.url || formValue.url === '') {
    //   errores.errors.url = true;
    // }

    if (!formValue.description > 200) {
      errores.errors.description = true;
    }

    if (!formValue.description || formValue.description === '') {
      errores.errors.description = true;
    }

    if (!/^\d+(\.\d+)*$/.test(formValue.goal)) {
      errores.errors.goal = true;
    }

    if (formValue.goal <= 0) {
      errores.errors.goal = true;
    }

    if (!formValue.goal || formValue.goal === '') {
      errores.errors.goal = true;
    }

    Object.entries(errores.errors).forEach((err) => {
      console.log(err);
      if (err[1]) {
        errores.isFormValid = false;
        console.log('Not Valid');
      }
    });

    setError(errores);

    return errores.isFormValid;
  };

  const initialFormState = () => {
    setError({
      isFormValid: true,
      errors: {
        title: false,
        url: false,
        description: false,
        goal: false,
      },
    });
  };

  return (
    <>
      <Head>
        <title>Requests</title>
      </Head>
      <Box>
        <Wrap className="container" justify="center" mt="4">
          {contractInfo.length !== 0 ? (
            renderRequests()
          ) : (
            <Box bg="whiteAlpha.100" p="3" borderRadius="lg" boxShadow="lg">
              <Heading size="md">No requests yet, Be the first!</Heading>
            </Box>
          )}
        </Wrap>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a Request</ModalHeader>
          <ModalCloseButton />
          {!connected && (
            <Alert status="warning">
              <AlertIcon />
              You need to connect your wallet
            </Alert>
          )}
          <ModalBody pb={6}>
            <FormControl mt={4} isRequired isInvalid={error.errors.title}>
              <FormLabel>Title</FormLabel>
              <InputGroup>
                <Input
                  placeholder="Title"
                  value={formValue.title}
                  onChange={(e) =>
                    setFormValue({ ...formValue, title: e.target.value })
                  }
                />
                <InputRightAddon
                  children={` ${
                    formValue.title ? formValue.title.length : 0
                  }/30 `}
                />
              </InputGroup>
            </FormControl>

            <FormControl mt={4} isInvalid={error.errors.url}>
              <FormLabel>Image URL</FormLabel>
              <Input
                placeholder="Image URL"
                value={formValue.url}
                onChange={(e) =>
                  setFormValue({ ...formValue, url: e.target.value })
                }
              />
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={error.errors.description}>
              <FormLabel>Description</FormLabel>
              <InputGroup>
                <Input
                  placeholder="Description"
                  value={formValue.description}
                  onChange={(e) =>
                    setFormValue({
                      ...formValue,
                      description: e.target.value,
                    })
                  }
                />
                <InputRightAddon
                  children={` ${
                    formValue.description ? formValue.description.length : 0
                  }/200 `}
                />
              </InputGroup>
            </FormControl>

            <FormControl mt={4} isRequired isInvalid={error.errors.goal}>
              <FormLabel>Goal</FormLabel>
              <Input
                placeholder="Goal"
                value={formValue.goal}
                onChange={(e) =>
                  setFormValue({
                    ...formValue,
                    goal: e.target.value,
                  })
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              disabled={!connected}
              isLoading={submitting}
              colorScheme="blue"
              onClick={handleModalClick}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <IconButton
        icon={<AddIcon />}
        size="lg"
        onClick={onOpen}
        pos="fixed"
        bottom="15px"
        right="15px">
        Create Request
      </IconButton>
    </>
  );
};

export default Requests;
