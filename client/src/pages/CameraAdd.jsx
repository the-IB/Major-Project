import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    Flex,
    Input,
    Card,
    CardBody,
    Center,
    HStack,
    Button,
    useToast,
    IconButton,
    Tooltip,
    Box,
    Progress,
    Text,
    Spinner
} from "@chakra-ui/react";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";
import { AddIcon } from "@chakra-ui/icons";
import ProcessedModal from "../components/ProcessedModal";
import UploadedModal from "../components/UploadedModal";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000";
const socket = io(API_URL);

const CameraAdd = () => {
    const [cameraUrl, setCameraUrl] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [fileURL, setFileURL] = useState(null);
    const [file, setFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileName, setFileName] = useState("");
    const [isProcessedModalOpen, setIsProcessedModalOpen] = useState(false);
    const [accidentCount, setAccidentCount] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [currentStatus, setCurrentStatus] = useState('');
    const fileInputRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        return () => {
            if (fileURL) URL.revokeObjectURL(fileURL);
        };
    }, [fileURL]);

    useEffect(() => {
        const onProcessed = (data) => {
            if (data.filename === fileName) {
                setIsProcessedModalOpen(true);
                setCurrentStatus('Processing complete!');
                setTimeout(() => {
                    setUploadProgress(0);
                    setProcessingProgress(0);
                    setCurrentStatus('');
                }, 3000);
            }
        };

        const onError = (data) => {
            if (data.filename === fileName) {
                toast({
                    title: "Processing Error",
                    description: data.message || "An unexpected error occurred during video processing",
                    status: "error",
                    duration: 6000,
                    isClosable: true
                });

                setUploadProgress(0);
                setProcessingProgress(0);
                setCurrentStatus('');
            }
        };

        const onProcessingProgress = (data) => {
            if (data.filename === fileName) {
                setProcessingProgress(data.progress);
                setCurrentStatus(
                    `Processing... ${data.progress}% | ` +
                    `Accidents: ${data.accidents || 0}`
                );
            }
        };

        socket.on("processing_progress", onProcessingProgress);
        socket.on("video_processed", onProcessed);
        socket.on("processing_error", onError);

        return () => {
            socket.off("processing_progress", onProcessingProgress);
            socket.off("video_processed", onProcessed);
            socket.off("processing_error", onError);
        };
    }, [fileName, toast]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            toast({
                title: "Invalid file type",
                description: "Please select a video file",
                status: "error",
                duration: 5000,
            });
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Maximum size is 100MB",
                status: "error",
                duration: 5000,
            });
            return;
        }

        if (fileURL) URL.revokeObjectURL(fileURL);

        setFileURL(URL.createObjectURL(file));
        setFile(file);
        setFileName(file.name);
        setIsModalOpen(true);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploadProgress(0);
        setProcessingProgress(0);
        setCurrentStatus('Starting upload...');
        setIsModalOpen(false);

        try {
            const formData = new FormData();
            formData.append("video", file);

            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(percent);
                    setCurrentStatus(`Uploading... (${percent}%)`);
                }
            });

            await new Promise((resolve, reject) => {
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            resolve(xhr.response);
                            setCurrentStatus('Processing started...');
                        } else {
                            try {
                                const errorResponse = JSON.parse(xhr.responseText || '{}');
                                reject(new Error(errorResponse.error || 'Upload failed'));
                            } catch {
                                reject(new Error(`Upload failed with status ${xhr.status}`));
                            }
                        }
                    }
                };
                xhr.open("POST", `${API_URL}/process-video`, true);
                xhr.send(formData);
            });

        } catch (error) {
            toast({
                title: "Upload failed",
                description: error.message,
                status: "error",
                duration: 5000,
            });
            setUploadProgress(0);
            setProcessingProgress(0);
            setCurrentStatus('');
        }
    };

    const validateCameraUrl = async () => {
        if (!cameraUrl.trim()) {
            toast({
                title: "Empty URL",
                description: "Please enter a camera URL",
                status: "error",
                duration: 3000,
            });
            return;
        }

        setIsValidating(true);

        try {
            const response = await fetch(`${API_URL}/validate-camera`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: cameraUrl }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast({
                title: "Camera added",
                description: data.message || "Camera connected successfully",
                status: "success",
                duration: 3000,
            });

            setCameraUrl("");
        } catch (error) {
            toast({
                title: "Validation failed",
                description: error.message,
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsValidating(false);
        }
    };

    const clearFile = () => {
        if (fileURL) URL.revokeObjectURL(fileURL);
        setFileURL(null);
        setFile(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Container maxW="100vw" px={5} py={3}>
            <Flex height="80vh" justify="center" align="center">
                <Center>
                    <Card shadow="md" borderRadius={15} minW={{ base: "90vw", md: "50vw" }} backgroundColor={"white"}>
                        <CardBody>
                            <HStack spacing={3}>
                                <Input
                                    placeholder="Enter RTSP or HTTP camera URL"
                                    value={cameraUrl}
                                    onChange={(e) => setCameraUrl(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && validateCameraUrl()}
                                />
                                <Tooltip label="Add camera stream">
                                    <Button
                                        onClick={validateCameraUrl}
                                        isLoading={isValidating}
                                        colorScheme="blue"
                                        px={4}
                                    >
                                        {!isValidating ? <AddIcon /> : <Spinner />}
                                    </Button>
                                </Tooltip>
                                <Tooltip label="Upload video file">
                                    <IconButton
                                        as="label"
                                        htmlFor="file-upload"
                                        colorScheme="teal"
                                        aria-label="Upload video"
                                        icon={<AiOutlineVideoCameraAdd size={22} />}
                                    />
                                </Tooltip>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="video/*"
                                    hidden
                                    onChange={handleFileSelect}
                                    ref={fileInputRef}
                                />
                            </HStack>
                            {(uploadProgress > 0 || processingProgress > 0) && (
                                <Box mt={4}>
                                    <Text fontSize="sm" mb={1}>
                                        {currentStatus || (
                                            uploadProgress < 100 ? "Uploading..." : "Processing..."
                                        )}
                                    </Text>
                                    <Progress
                                        value={uploadProgress < 100 ? uploadProgress : processingProgress}
                                        size="sm"
                                        colorScheme={uploadProgress < 100 ? "blue" : "green"}
                                        hasStripe
                                        isAnimated
                                    />
                                    <Text fontSize="xs" textAlign="right" mt={1}>
                                        {uploadProgress < 100
                                            ? `${uploadProgress}% uploaded`
                                            : `${processingProgress}% processed`}
                                    </Text>
                                </Box>
                            )}
                        </CardBody>
                    </Card>

                    <UploadedModal
                        file={fileURL}
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            clearFile();
                        }}
                        onConfirm={handleUpload}
                    />

                    <ProcessedModal
                        isOpen={isProcessedModalOpen}
                        onClose={() => {
                            setIsProcessedModalOpen(false);
                            clearFile();
                        }}
                        videoFilename={fileName}
                    />
                </Center>
            </Flex>
        </Container>
    );
};

export default CameraAdd;