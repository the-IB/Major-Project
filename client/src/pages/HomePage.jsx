import React from 'react'
import { Container, Card, CardBody, Flex, Text, Center } from '@chakra-ui/react'
const HomePage = () => {
    return (
        <Container maxW={"100vw"} px={5} py={3}>
            <Flex
                height={"80vh"}
                justify={"center"}
                align={"center"}>
                <Center>
                    <Card borderRadius={15} maxW={"50vw"} bgColor={'white'}>
                        <CardBody>
                            <Text
                                fontSize={{ base: "12", sm: "18" }}
                            >
                                Our AI-Powered <b>Accident Detection System</b> utilizes roadside cameras to continuously monitor traffic and detect accidents in real time. Live footage is transmitted to a central server, where <b>YOLOv8</b>, an advanced object detection model, processes the video to identify collisions or hazardous incidents. Upon detecting an accident, the system automatically analyzes the severity and notifies emergency services with precise location details. This technology enhances response times, reduces human monitoring efforts, and improves road safety by providing real-time, AI-driven accident detection and reporting.
                            </Text>
                        </CardBody>
                    </Card>
                </Center>
            </Flex>
        </Container >
    )
}

export default HomePage