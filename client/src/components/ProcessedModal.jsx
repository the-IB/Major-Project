import React, { useRef } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    AspectRatio
} from '@chakra-ui/react';

const ProcessedModal = ({
    isOpen,
    onClose,
    videoFilename
}) => {
    const videoRef = useRef(null);
    const apiUrl = 'http://localhost:5000';
    const videoSrc = `${apiUrl}/processed/${videoFilename}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Processed Video</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <AspectRatio ratio={16 / 9} width="100%">
                        <video
                            ref={videoRef}
                            controls
                            autoPlay
                            muted
                            playsInline
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '8px',
                                backgroundColor: '#f0f0f0'
                            }}
                        >
                            <source src={videoSrc} type="video/mp4" />
                            Your browser doesn't support HTML5 video.
                        </video>
                    </AspectRatio>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={onClose} colorScheme="blue">
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ProcessedModal;