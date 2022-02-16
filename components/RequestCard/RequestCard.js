import react, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Progress,
  Badge,
  Heading,
  Stack,
  WrapItem,
} from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getBalanceOf } from '../../celo/utils';

const RequestCard = ({ data }) => {
  const [balance, setBalance] = useState();

  useEffect(async () => {
    const res = await getBalanceOf(data.address);
    setBalance(res);
  }, []);

  const goalPercentage = () => {
    let bal = parseFloat(balance);
    let goal = parseFloat(data.goal.shiftedBy(-18).toString());
    return (bal * 100) / goal;
  };

  return (
    <WrapItem>
      <Flex
        w="350px"
        h="400px"
        direction="column"
        className="container"
        boxShadow="xl">
        <Box h="65%" w="350px" pos="relative" bg="whiteAlpha.100">
          {/* <Image
            src="https://concepto.de/wp-content/uploads/2015/03/paisaje-800x409.jpg"
            layout="fill"
            objectFit="cover"
          /> */}
          {data.image !== '' ? (
            <img
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              src={data.image}
            />
          ) : (
            <></>
          )}
        </Box>
        <Stack h="30%" m="3" direction="column" justify="flex-end">
          <Flex>
            <Badge
              m="auto"
              ml="0"
              colorScheme={data.requestEnded ? 'red' : 'purple'}>
              {data.requestEnded ? 'Ended' : 'New'}
            </Badge>
            <Box>
              <Heading size="sm">{`cUSD ${data.goal
                .shiftedBy(-18)
                .toString()}`}</Heading>
            </Box>
          </Flex>
          <Heading size="md">{data.name}</Heading>
          <Progress value={goalPercentage()} />
          <Link href={`/requests/${data.address}`}>
            <Button m="auto">Contribute</Button>
          </Link>
        </Stack>
      </Flex>
    </WrapItem>
  );
};

export default RequestCard;
