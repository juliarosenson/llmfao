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
  VStack
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
  onContinue?:() => Promise<void>;
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
    try{
      if (!crmFile) {
        toast({
          title: 'Please upload your CRM export sample.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
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

  return (
    <Box w="100vw" maxW="1000px" mt={10} border="2px solid #38b6ff" borderRadius="lg" p={8}>
      <Button variant="ghost" mb={4} onClick={onBack}>
        ← Back to Templates
      </Button>
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
        Create Export Template
      </Text>
      <HStack spacing={6} mb={6} align="flex-start" justify="center">
        <FormControl>
          <FormLabel>Template Name</FormLabel>
          <Input
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="Template Name"
          />
        </FormControl>
        <FormControl>
          <FormLabel>File Name Pattern</FormLabel>
          <Input
            value={fileNamePattern}
            onChange={e => setFileNamePattern(e.target.value)}
            placeholder="File Name Pattern"
          />
          <Text fontSize="sm" color="gray.500" mt={1}>
            Preview: export_2024-07-01_00-00_2024-07-31_23.csv
          </Text>
        </FormControl>
      </HStack>
      <Box mb={2} mt={8}>
        <Text fontWeight="bold" fontSize="lg">
          Upload your CRM export sample
        </Text>
        <Text color="gray.500" fontSize="md" mb={4}>
          Upload an example export from your CRM so we can match the format you need
        </Text>
      </Box>
      <Box
        border="2px dashed #cbd5e1"
        borderRadius="lg"
        minH="180px"
        mb={8}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        cursor="pointer"
        onClick={() => fileInputRef.current?.click()}
        transition="border-color 0.2s"
        _hover={{ borderColor: '#38b6ff' }}
      >
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <VStack>
          <StarIcon color="yellow.400" boxSize={8} mb={2} />
          <Text fontWeight="medium" color="gray.600">
            Drag and drop file
          </Text>
          <Text fontSize="sm" color="gray.400">
            or click to browse
          </Text>
          {crmFile && (
            <Text mt={2} fontSize="sm" color="blue.600">
              Selected: {crmFile.name}
            </Text>
          )}
        </VStack>
      </Box>
      <Flex justify="flex-end">
        {loading ? 
        <Text fontSize="lg" color="blue.600" fontWeight="bold">
          Generating Rules...
        </Text>
        :<Button colorScheme="blue" size="lg" onClick={handleContinue}>
          Continue
        </Button>}
      </Flex>
    </Box>
  );
};

export default Upload; 