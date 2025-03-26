// src/pages/RegisterPage.js
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
    Select,
    useToast
} from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await register(username, password, role);
        setIsLoading(false);

        if (result.success) {
            toast({
                title: 'Registration Successful',
                description: 'You can now login with your credentials',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            navigate('/login');
        } else {
            toast({
                title: 'Registration Failed',
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
                            <Heading mb={6} textAlign="center">Register</Heading>
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
                                <FormControl mb={4}>
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </FormControl>
                                <FormControl mb={6}>
                                    <FormLabel>Account Type</FormLabel>
                                    <Select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="user">Normal User</option>
                                        <option value="admin">Admin</option>
                                    </Select>
                                </FormControl>
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    width="100%"
                                    isLoading={isLoading}
                                >
                                    Register
                                </Button>
                            </form>
                            <Text mt={4} textAlign="center">
                                Already have an account?{' '}
                                <Link color="blue.500" onClick={() => navigate('/login')}>
                                    Login here
                                </Link>
                            </Text>
                        </CardBody>
                    </Card>
                </Center>
            </Flex>
        </Container>
    );
};

export default RegisterPage;