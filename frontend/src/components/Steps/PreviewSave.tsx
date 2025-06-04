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
  rules: ColumnMappingsResponse;
  csvPreview: string;
  originalData: Record<string, any>[];
  templateName: string;
  fileNamePattern: string;
  onBack: () => void;
  onSave: () => void;
}

const PreviewAndSave: React.FC<PreviewAndSaveProps> = ({ rules, onBack, onSave, csvPreview, originalData, templateName, fileNamePattern }) => {
  const colsWithRules = rules.filter(mapping => mapping.rule);
  const csvRows = csvPreview.split('\n').map(row => row.split(','));
  
  return (
    <Box w="100%" maxW="1400px" mx="auto" p={6}>
      {/* Header */}
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Preview & Save Template
      </Text>

      {/* Success Banner */}
      {colsWithRules.length === rules.length && (<Box
        bg="green.50"
        border="1px solid"
        borderColor="green.200"
        borderRadius="md"
        p={4}
        mb={8}
      >
        <HStack>
          <CheckCircleIcon color="green.500" boxSize={5} />
          <Text color="green.700" fontWeight="medium">
            All mapping rules configured! Ready to transform your data.
          </Text>
        </HStack>
      </Box>)}

      {/* Data Tables */}
      <VStack spacing={8} mb={8} align="stretch">
        {/* Original Data Table */}
        <Box flex="1">
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.700">
            📊 Original Donation Data
          </Text>
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
            overflowX="auto"
            maxW="100%"
          >
            <Table size="sm" minW="600px">
              <Thead bg="gray.50">
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
                        {String(value)}
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
            🎯 Transformed CRM Format
          </Text>
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
            overflowX="auto"
            maxW="100%"
          >
            <Table size="sm" minW="600px">
              <Thead bg="gray.50">
                <Tr>
                  {csvRows[0]?.map((col, index) => (
                    <Th key={index} fontSize="xs" color="gray.600" whiteSpace="nowrap">
                      {col}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {csvRows.slice(1, csvRows.length).map((row, index) => (
                  <Tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <Td key={cellIndex} fontSize="sm" whiteSpace="nowrap">
                        {cell}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>

      {/* Template Summary */}
      <Box
        bg="blue.50"
        border="1px solid"
        borderColor="blue.200"
        borderRadius="md"
        p={6}
        mb={8}
      >
        <HStack align="flex-start" spacing={4}>
          <CheckCircleIcon color="blue.500" boxSize={6} mt={1} />
          <VStack align="flex-start" spacing={2}>
            <Text fontWeight="bold" color="blue.700" fontSize="lg">
              Template Summary
            </Text>
            <VStack align="flex-start" spacing={1} color="blue.600">
              <Text fontSize="sm">• Template: {templateName}</Text>
              <Text fontSize="sm">• File pattern: {fileNamePattern}</Text>
              <Text fontSize="sm">• {colsWithRules.length} transformation rules created</Text>
              <Text fontSize="sm">• {rules.length - colsWithRules.length} field mappings unresolved</Text>
            </VStack>
          </VStack>
        </HStack>
      </Box>

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