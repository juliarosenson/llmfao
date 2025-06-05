import { ArrowDownIcon, CheckCircleIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { ColumnMappingsResponse } from '../../lib/prompt';


interface PreviewAndSaveProps {
  rules: ColumnMappingsResponse["columnMappings"];
  previewData: Record<string, any>[];
  originalData: Record<string, any>[];
  templateName: string;
  fileNamePattern: string;
  onBack: () => void;
  onSave: () => void;
}

const PreviewAndSave: React.FC<PreviewAndSaveProps> = ({ rules, onBack, onSave, previewData, originalData, templateName, fileNamePattern }) => {
  return (
    <Box w="100%" maxW="1400px" mx="auto" p={6}>
      {/* Header */}
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Preview & Save Template
      </Text>

      {/* Template Summary */}
      <Box
        border="1px solid"
        borderColor="blue.200"
        borderRadius="md"
        p={6}
        mb={8}
      >
        <HStack align="flex-start" spacing={4}>
          <VStack align="flex-start" spacing={2}>
          <HStack align="flex-start" spacing={4}>
            <Text fontWeight="bold" color="blue.700" fontSize="lg">
            Template:
            </Text>
            <Text color="blue.700" fontSize="lg">
            {templateName}
            </Text>
          </HStack>
          <HStack align="flex-start" spacing={4}>
            <Text fontWeight="bold" color="blue.700" fontSize="lg">
            Output file name pattern:
            </Text>
            <Text color="blue.700" fontSize="lg">
            {fileNamePattern}
            </Text>
          </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Data Tables */}
      <VStack spacing={8} mb={8} align="stretch">
        {/* Original Data Table */}
        <Box flex="1">
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
            Original Donation Data
          </Text>
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
            overflowX="auto"
            overflowY="auto"
            maxW="100%"
            maxH="300px"
          >
            <Table size="sm" minW="600px">
              <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                <Tr>
                  {Object.keys(originalData[0] || {}).map((key) => (
                    <Th key={key} fontSize="xs" color="gray.600" whiteSpace="nowrap">
                      {key}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {originalData.map((row, index) => (
                  <Tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <Td key={cellIndex} fontSize="sm" whiteSpace="nowrap">
                        {value? String(value): "-"}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Arrow */}
        <Flex align="center" justify="center">
          <Icon as={ArrowDownIcon} boxSize={8} color="blue.400" />
        </Flex>

        {/* Transformed Data Table */}
        <Box flex="1">
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
            Transformed CRM Format
          </Text>
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
            overflowX="auto"
            overflowY="auto"
            maxW="100%"
            maxH="300px"
          >
            <Table size="sm" minW="600px">
              <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                <Tr>
                {Object.keys(previewData[0] || {}).map((key) => (
                    <Th key={key} fontSize="xs" color="gray.600" whiteSpace="nowrap">
                      {key}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
              {previewData.map((row, index) => (
                  <Tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <Td key={cellIndex} fontSize="sm" whiteSpace="nowrap">
                        {value? String(value): "-"}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>

      {/* Action Buttons */}
      <Flex justify="center" gap={4}>
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          px={8}
        >
          ← Back to Rules
        </Button>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={onSave}
          px={8}
          leftIcon={<CheckCircleIcon />}
        >
          Save Template
        </Button>
      </Flex>
    </Box>
  );
};

export default PreviewAndSave;