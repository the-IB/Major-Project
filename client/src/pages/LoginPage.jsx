// src/pages/LoginPage.js
import React, { useState, useContext } from 'react';
import {
    Container,
    Card,
    CardBody,
    Flex,
    Text,
    Center,
    Input,
    Button,
    FormControl,
    FormLabel,
    Heading,
    Link,
    useToast
} from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(username, password);
        setIsLoading(false);

        if (!result.success) {
            toast({
                title: 'Login Failed',
                description: result.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Container maxW={"100vw"} px={5} py={3}>
            <Flex height={"80vh"} justify={"center"} align={"center"}>
                <Center>
                    <Card borderRadius={15} width={{ base: "90vw", md: "50vw" }} bgColor={'white'}>
                        <CardBody p={8}>
                            <Heading mb={6} textAlign="center">Login</Heading>
                            <form onSubmit={handleSubmit}>
                                <FormControl mb={4}>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </FormControl>
                                <FormControl mb={6}>
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormControl>
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    width="100%"
                                    isLoading={isLoading}
                                >
                                    Login
                                </Button>
                            </form>
                            <Text mt={4} textAlign="center">
                                Don't have an account?{' '}
                                <Link color="blue.500" onClick={() => navigate('/register')}>
                                    Register here
                                </Link>
                            </Text>
                        </CardBody>
                    </Card>
                </Center>
            </Flex>
        </Container>
    );
};

export default LoginPage;