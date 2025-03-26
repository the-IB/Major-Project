import React, { useContext } from 'react'
import { MdAccountCircle } from "react-icons/md";
import { TbCameraPlus } from "react-icons/tb";
import {
    Container,
    Flex,
    Button,
    HStack,
    Text,
    Center,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Avatar,
    IconButton
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

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
                    {/* Show camera button only for authenticated users */}
                    {user && (
                        <Link to={"/camera"}>
                            <Button leftIcon={<TbCameraPlus />} colorScheme="blue" variant="solid">
                                Add Camera
                            </Button>
                        </Link>
                    )}

                    {/* User account dropdown */}
                    {user ? (
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                aria-label="Account"
                                icon={
                                    <Avatar
                                        size="sm"
                                        name={user.username}
                                        src={user.avatar}
                                        icon={<MdAccountCircle fontSize="1.5rem" />}
                                    />
                                }
                                variant="ghost"
                            />
                            <MenuList>
                                <MenuItem>
                                    <Text fontWeight="bold">{user.username}</Text>
                                </MenuItem>
                                <MenuItem>
                                    Role: <Text as="span" color="blue.500" ml={1}>{user.role}</Text>
                                </MenuItem>
                                <MenuItem onClick={logout} color="red.500">
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    ) : (
                        <Link to="/login">
                            <Button leftIcon={<MdAccountCircle />} colorScheme="blue" variant="outline">
                                Login
                            </Button>
                        </Link>
                    )}
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;