import React from 'react'
import { TbCameraPlus } from "react-icons/tb";
import {
    Container,
    Flex,
    Button,
    HStack,
    Text
} from '@chakra-ui/react'
import { Link } from 'react-router-dom';


const Navbar = () => {
    return (
        <Container maxW={"100vw"} px={5} py={3}>
            <Flex
                alignItems={"center"}
                justifyContent={"space-between"}
                flexDir={{
                    base: "column",
                    sm: "row"
                }}>
                <Text
                    bgGradient='linear(to-l,rgb(255, 30, 0),white)'
                    bgClip='text'
                    fontSize={{ base: "22", sm: "28" }}
                    fontWeight={"bold"}
                    textTransform={'uppercase'}
                    textAlign={'center'}
                    bgColor={'black'}
                >
                    <Link to={"/"}> Accident Detection </Link>
                </Text>

                <HStack spacing={2} alignItems={"center"}>
                    <Link to={"/camera"}>
                        <Button leftIcon={<TbCameraPlus />} colorScheme="blue" variant="solid">
                            Add Camera
                        </Button>
                    </Link>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;