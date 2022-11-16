import {
  Box,
  Heading,
  Text,
  Avatar,
  Center,
  CircularProgress,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Chart from "react-apexcharts";
import NotFound from "./notFound";
import moment from "moment";
import { gql, useQuery } from "@apollo/client";

const Token = () => {
  const address = useParams().address;
  const TOKEN_NAME = gql`
    query ($address: String!) {
      token(id: $address) {
        name
        symbol
      }
    }
  `;

  const [predictions, setPredictions] = useState();
  const { data } = useQuery(TOKEN_NAME, {
    variables: { address },
  });

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = fetch(`https://dspyt.herokuapp.com/?f=10&a=${address}`);
        const info = await (await res).json();
        //console.log(info);
        const fetchedPredictions = info.predictions.map((prediction, i) => {
          const time = new Date((Number(info.last_date) + i * 86400) * 1000);
          //console.log(time);
          //console.log(moment(time).format("Do MM"));
          return {
            price: prediction.toFixed(4),
            timestamp: time,
            time: moment(time).format("Do MMM"),
          };
        });

        setPredictions(fetchedPredictions);
      } catch {
        console.log("not available");
      }
    }
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) fetchPrediction();
  }, [address]);
  if (address.match(/^0x[a-fA-F0-9]{40}$/))
    if (!data)
      return (
        <Center mt="20">
          <CircularProgress
            isIndeterminate
            thickness="6px"
            speed="0.65s"
            color="blue.500"
            size="200"
          />
        </Center>
      );
  if (data.token)
    return (
      <Box p="2">
        {data && (
          <Heading textAlign="center" mt="4" mb="2">
            <Avatar
              mx="2"
              src={`https://tokens.1inch.io/${address}.png`}
              name={data.token.symbol}
            />

            {`${data.token.name} (${data.token.symbol})`}
          </Heading>
        )}
        {data && predictions && (
          <Box
            mx="auto"
            rounded="md"
            maxW="1000px"
            bgColor="gray.200"
            p="3"
            my="10"
          >
            <Text textAlign="center" fontWeight="bold">
              Predictions
            </Text>
            <Chart
              options={{
                chart: {
                  id: "prediction-chart",
                },
                xaxis: {
                  categories: predictions.map((p) => p.time),
                },
              }}
              series={[
                {
                  name: "prediction",
                  data: predictions.map((p) => p.price),
                },
              ]}
              type="area"
            />
          </Box>
        )}
      </Box>
    );
  return <NotFound />;
};

export default Token;
