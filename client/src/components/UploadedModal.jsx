import { useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    ModalFooter,
    ModalHeader,
    Text,
    useToast,
    Progress,
    Box,
    Alert,
    AlertIcon,
    AspectRatio
} from "@chakra-ui/react";

const UploadedModal = ({ file, isOpen, onClose, onConfirm, isLoading }) => {
    const [videoError, setVideoError] = useState(false);
    const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });
    const toast = useToast();

    useEffect(() => {
        if (file) {
            // Extract file name from URL or provide a default
            const fileName = file instanceof File ? file.name : "preview_video.mp4";
            const fileSize = file instanceof File ? file.size : 0;
            setFileInfo({ name: fileName, size: fileSize });
            setVideoError(false);
        }
    }, [file]);

    const handleVideoError = (e) => {
        console.error("Video playback error:", e.target.error);
        setVideoError(true);
        toast({
            title: "Playback error",
            description: "Could not load the video preview",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Modal
            isOpen={isOpen}
            size="xl"
            isCentered
            closeOnOverlayClick={!isLoading}
            closeOnEsc={!isLoading}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Video Preview</ModalHeader>
                <ModalCloseButton
                    onClick={onClose}
                    isDisabled={isLoading}
                    aria-label="Close video preview"
                />
                <ModalBody p={5}>
                    <VStack spacing={4}>
                        {videoError ? (
                            <Alert status="error" borderRadius="md">
                                <AlertIcon />
                                Could not load video preview
                            </Alert>
                        ) : (
                            <AspectRatio ratio={16 / 9} width="100%">
                                <video
                                    controls
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: "8px",
                                        backgroundColor: "#f0f0f0"
                                    }}
                                    onError={handleVideoError}
                                >
                                    <source src={file} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </AspectRatio>
                        )}

                        <Box width="100%">
                            <Text fontSize="sm" fontWeight="medium">
                                {fileInfo.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {formatFileSize(fileInfo.size)}
                            </Text>
                        </Box>

                        {isLoading && (
                            <Box width="100%" mt={2}>
                                <Progress size="sm" isIndeterminate colorScheme="green" />
                                <Text fontSize="xs" textAlign="center" mt={1}>
                                    Uploading your video...
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="gray"
                        mr={3}
                        onClick={onClose}
                        isDisabled={isLoading}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={onConfirm}
                        isLoading={isLoading}
                        loadingText="Uploading"
                        spinnerPlacement="start"
                        isDisabled={videoError}
                    >
                        Confirm Upload
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UploadedModal;