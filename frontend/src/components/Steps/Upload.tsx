import { StarIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  useToast,
  VStack,
  Spinner,
  Select
} from '@chakra-ui/react';
import React, { useRef } from 'react';

interface UploadProps {
  templateName?: string;
  setTemplateName: (t: string) => void;
  crmFile: File | null;
  setCrmFile: (file: File | null) => void;
  fileNamePattern?: string;
  setFileNamePattern: (pattern: string) => void;
  onBack?: () => void;
  onContinue?: () => Promise<void>;
}

const Upload: React.FC<UploadProps> = ({
  onBack,
  onContinue,
  crmFile,
  setCrmFile,
  templateName,
  setTemplateName,
  fileNamePattern,
  setFileNamePattern,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [crmProvider, setCrmProvider] = React.useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCrmFile(e.target.files?.[0] || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setCrmFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleContinue = async () => {
    setLoading(true);
    console.log('Continuing with file:', crmFile);
    console.log('Template Name:', templateName);
    console.log('File Name Pattern:', fileNamePattern);
    console.log('CRM Provider:', crmProvider);
    try {
      if (!crmFile) {
        toast({
          title: 'Please upload your CRM export sample.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      if (!templateName) {
        toast({
          title: 'Please enter a template name.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      if (onContinue) {
        console.log('Calling onContinue callback');
        await onContinue();
      }
    } catch (error) {
      console.error('Error during continue:', error);
      toast({
        title: 'An error occurred while processing your file.',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&display=swap');

    .upload-container * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    .upload-area {
      border: 2px dashed #DBE0E5;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      background: #FAFBFC;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .upload-area:hover {
      border-color: #35BBF4;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(53, 187, 244, 0.15);
    }

    .form-input {
      transition: all 0.2s ease;
    }

    .form-input:focus {
      transform: translateY(-1px);
    }

    .continue-button {
      background: linear-gradient(135deg, #35BBF4 0%, #2da8d8 100%);
      transition: all 0.3s ease;
    }

    .continue-button:hover {
      background: linear-gradient(135deg, #2da8d8 0%, #2596c4 100%) !important;
      transform: translateY(-2px);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Loading Overlay */}
      {loading && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          backdropFilter="blur(10px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
        >
          <VStack spacing={4}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Text fontSize="lg" color="white" fontWeight="bold">
              Generating Rules...
            </Text>
          </VStack>
        </Box>
      )}

      <Box minH="100vh" bg="white" className="upload-container">
        {/* Main Content */}
        <Box p="32px 48px" maxW="1200px" mx="auto">
          {/* Back Button */}
          <Button
            variant="link"
            color="#35BBF4"
            fontSize="14px"
            mb="32px"
            p={0}
            h="auto"
            onClick={onBack}
            _hover={{ textDecoration: "underline" }}
          >
            <Text mr="8px">←</Text>
            Back to Templates
          </Button>

          {/* Page Title */}
          <Text
            fontSize="32px"
            fontWeight="500"
            mb="40px"
            color="#333"
          >
            Create Export Template
          </Text>

          {/* File Set Up Section */}
          <Box mb="40px">
            <Text
              fontSize="20px"
              fontWeight="500"
              mb="24px"
              color="#333"
              borderBottom="2px solid #DBE0E5"
              pb="8px"
            >
              File Set Up
            </Text>

            <VStack spacing="24px" align="stretch">
              {/* Template Name */}
              <FormControl>
                <FormLabel
                  fontSize="14px"
                  fontWeight="450"
                  mb="8px"
                  color="#333"
                >
                  Template Name
                </FormLabel>
                <Input
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="Testing"
                  p="14px 16px"
                  border="1px solid #DBE0E5"
                  borderRadius="8px"
                  fontSize="14px"
                  bg="white"
                  className="form-input"
                  _focus={{
                    outline: "none",
                    borderColor: "#35BBF4",
                    boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                  }}
                />
              </FormControl>

              {/* File Name Pattern */}
              <FormControl>
                <FormLabel
                  fontSize="14px"
                  fontWeight="450"
                  mb="8px"
                  color="#333"
                >
                  File Name Pattern
                </FormLabel>
                <Input
                  value={fileNamePattern}
                  onChange={e => setFileNamePattern(e.target.value)}
                  placeholder="export_Start Date_End Date"
                  p="14px 16px"
                  border="1px solid #DBE0E5"
                  borderRadius="8px"
                  fontSize="14px"
                  bg="white"
                  className="form-input"
                  _focus={{
                    outline: "none",
                    borderColor: "#35BBF4",
                    boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                  }}
                />
                <Text fontSize="12px" color="#666" mt="4px">
                  Preview: export_2024-07-01_00-00_2024-07-31_23.csv
                </Text>
              </FormControl>

              {/* CRM Provider */}
              <FormControl>
                <FormLabel
                  fontSize="14px"
                  fontWeight="450"
                  mb="8px"
                  color="#333"
                >
                  CRM Provider
                </FormLabel>
                <Select
                  value={crmProvider}
                  onChange={e => setCrmProvider(e.target.value)}
                  placeholder="Select your CRM provider"
                  w="full"
                  border="1px solid #DBE0E5"
                  borderRadius="8px"
                  fontSize="14px"
                  bg="white"
                  className="form-input"
                  _focus={{
                    outline: "none",
                    borderColor: "#35BBF4",
                    boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                  }}
                >
                  <option value="salesforce">Salesforce</option>
                  <option value="raisers-edge">Raiser's Edge</option>
                  <option value="virtuous">Virtuous</option>
                  <option value="admire">Admire</option>
                  <option value="everyaction">EveryAction</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </VStack>
          </Box>

          {/* Upload Section */}
          <Box mb="40px">
            <Text
              fontSize="20px"
              fontWeight="500"
              mb="24px"
              color="#333"
              borderBottom="2px solid #DBE0E5"
              pb="8px"
            >
              Upload a CRM sample
            </Text>

            <Text fontSize="14px" color="#666" mb="24px">
              Upload a csv of the data you upload to your CRM so we can match the format you need
            </Text>

            <Box
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Box
                w="48px"
                h="48px"
                mx="auto"
                mb="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="#35BBF4"
                fontSize="24px"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </Box>

              <Text fontSize="16px" fontWeight="450" color="#333" mb="8px">
                {crmFile ? `Selected: ${crmFile.name}` : "Drag and drop file"}
              </Text>

              <Text fontSize="14px" color="#666">
                or click to browse
              </Text>
            </Box>
          </Box>

          {/* Continue Button */}
          <Flex justify="flex-end">
            <Button
              className="continue-button"
              color="white"
              p="14px 32px"
              border="none"
              borderRadius="8px"
              fontSize="14px"
              fontWeight="500"
              cursor="pointer"
              onClick={handleContinue}
              isDisabled={loading}
              _hover={{}}
            >
              Continue
            </Button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default Upload;