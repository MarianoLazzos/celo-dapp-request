import Navbar from '../components/Navbar/Navbar';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Heading, Button, Flex, Box } from '@chakra-ui/react';
import { EditIcon, TimeIcon, LinkIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { fetchAllRequests, createRequestsInstances } from '../celo/utils';
import Head from 'next/head';

export default function Home() {
  const [requestCreated, setRequestsCreated] = useState(0);
  let [requestEnded, setRequestsEnded] = useState(0);
  const [requestOngoing, setRequestsOngoing] = useState(0);

  useEffect(async () => {
    const rq = await fetchAllRequests();
    const ri = await createRequestsInstances(rq);
    const rd = await fetchRequestData(ri);
    setRequestsCreated(rq.length);
    calculateMetrics(rd, rq.length);
  }, []);

  const calculateMetrics = (requests, created) => {
    requests.forEach((req) => {
      if (req.requestEnded) {
        setRequestsEnded(++requestEnded);
      }
    });

    setRequestsOngoing(created - requestEnded);
  };

  const fetchRequestData = async (ri) => {
    const requests = await Promise.all(
      Array(ri.length)
        .fill()
        .map((element, index) => {
          return new Promise(async (resolve, reject) => {
            let r = await ri[index].methods.getInfo().call();
            resolve({
              requestEnded: r[5],
            });
          });
        })
    );

    return requests;
  };

  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <Flex height={500} align="center" direction="column" justify="center">
        <Heading
          fontWeight="thin"
          letterSpacing={5}
          as="h1"
          size="4xl"
          textAlign="center">
          START CREATING A REQUEST
        </Heading>
        <Heading as="h2" size="md" m="10px 7px 15px 7px" textAlign="center">
          Create a request and let people help you reach the goal
        </Heading>
        <Link href="/requests">
          <Button>Create a Request</Button>
        </Link>
      </Flex>
      <Flex justify="center" wrap="wrap">
        <Flex
          w="350px"
          h="200px"
          mr="4"
          boxShadow="xl"
          borderRadius="md"
          justify="center"
          align="center"
          direction="column">
          <TimeIcon w={12} h={12} m="7" />
          <Flex flex={1} justify="center" align="center" p="5">
            <Heading as="h2" size="md">
              Create a request is easy and fast!
            </Heading>
          </Flex>
        </Flex>
        <Flex
          w="350px"
          h="200px"
          mr="4"
          boxShadow="xl"
          borderRadius="md"
          justify="center"
          align="center"
          direction="column">
          <EditIcon w={12} h={12} m="7" />
          <Flex flex={1} justify="center" align="center" p="5">
            <Heading as="h2" size="md">
              Based on Smart Contracts
            </Heading>
          </Flex>
        </Flex>
        <Flex
          w="350px"
          h="200px"
          mr="4"
          boxShadow="xl"
          borderRadius="md"
          justify="center"
          align="center"
          direction="column">
          <LinkIcon w={12} h={12} m="7" />
          <Flex flex={1} justify="center" align="center" p="5">
            <Heading as="h2" size="md">
              Built on Celo Blockchain
            </Heading>
          </Flex>
        </Flex>
      </Flex>

      <Flex justify="center" mt="50px" wrap="wrap">
        <Box
          fontSize="x-large"
          boxShadow="xl"
          p="15px 25px"
          borderRadius="md"
          w="220px"
          m="10px">
          <Heading as="h2" size="sm">
            Total Requests Created
          </Heading>
          {requestCreated}
        </Box>
        <Box
          fontSize="x-large"
          boxShadow="xl"
          p="15px 25px"
          borderRadius="md"
          w="220px"
          m="10px">
          <Heading as="h2" size="sm">
            Requests Ended
          </Heading>
          {requestEnded}
        </Box>
        <Box
          fontSize="x-large"
          boxShadow="xl"
          p="15px 25px"
          borderRadius="md"
          w="220px"
          m="10px">
          <Heading as="h2" size="sm">
            Requests Ongoing
          </Heading>
          {requestOngoing}
        </Box>
        {/* <Box
          fontSize="x-large"
          boxShadow="xl"
          p="15px 25px"
          borderRadius="md"
          w="220px"
          m="10px">
          <Heading as="h2" size="sm">
            Github Project Stars
          </Heading>
          0
        </Box> */}
      </Flex>
    </div>
  );
}
