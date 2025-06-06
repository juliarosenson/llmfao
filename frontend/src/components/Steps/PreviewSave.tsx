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

const PreviewAndSave: React.FC<PreviewAndSaveProps> = ({
  rules,
  onBack,
  onSave,
  previewData,
  originalData,
  templateName,
  fileNamePattern
}) => {
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&display=swap');

    .preview-container * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }

    .save-button {
      background: linear-gradient(135deg, #35BBF4 0%, #2da8d8 100%);
      transition: all 0.3s ease;
    }

    .save-button:hover {
      background: linear-gradient(135deg, #2da8d8 0%, #2596c4 100%) !important;
      transform: translateY(-2px);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <Box className="preview-container" w="100%" maxW="1200px" mx="auto" p="32px 48px">
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
          mb="32px"
          color="#333"
        >
          Preview & Save Template
        </Text>

        {/* Template Info Section */}
        <Box
          bg="#F8FAFB"
          border="1px solid #DBE0E5"
          borderRadius="8px"
          p="20px"
          mb="32px"
        >
          <Flex mb="8px">
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#333"
              w="200px"
            >
              Template:
            </Text>
            <Text fontSize="14px" color="#657482">
              {templateName}
            </Text>
          </Flex>
          <Flex>
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#333"
              w="200px"
            >
              Output file name pattern:
            </Text>
            <Text fontSize="14px" color="#657482">
              {fileNamePattern}
            </Text>
          </Flex>
        </Box>

        {/* Original Data Section */}
        <Box mb="8px">
          <Text
            fontSize="20px"
            fontWeight="500"
            mb="16px"
            color="#333"
          >
            Original Donation Data
          </Text>
          <Box
            border="1px solid #DBE0E5"
            borderRadius="8px"
            overflow="hidden"
            mb="8px"
          >
            <Table size="sm" fontSize="13px">
              <Thead>
                <Tr bg="#F8FAFB">
                  {Object.keys(originalData[0] || {}).map((key) => (
                    <Th
                      key={key}
                      color="#657482"
                      fontWeight="500"
                      p="12px 16px"
                      borderBottom="1px solid #DBE0E5"
                      fontSize="12px"
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {key}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {originalData.slice(0, 5).map((row, index) => (
                  <Tr
                    key={index}
                    _hover={{ bg: "#FAFBFC" }}
                    _last={{ "& td": { borderBottom: "none" } }}
                  >
                    {Object.values(row).map((value, cellIndex) => (
                      <Td
                        key={cellIndex}
                        p="12px 16px"
                        borderBottom="1px solid #F6F8FA"
                        color="#333"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        maxW="200px"
                      >
                        {value ? String(value) : "-"}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Transform Arrow */}
        <Box textAlign="center" p="8px">
          <Text color="#35BBF4" fontSize="24px">↓</Text>
        </Box>

        {/* Transformed Data Section */}
        <Box mb="32px">
          <Text
            fontSize="20px"
            fontWeight="500"
            mb="16px"
            color="#333"
          >
            Transformed CRM Format
          </Text>
          <Box
            border="1px solid #DBE0E5"
            borderRadius="8px"
            overflow="hidden"
            mb="8px"
          >
            <Table size="sm" fontSize="13px">
              <Thead>
                <Tr bg="#F8FAFB">
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <Th
                      key={key}
                      color="#657482"
                      fontWeight="500"
                      p="12px 16px"
                      borderBottom="1px solid #DBE0E5"
                      fontSize="12px"
                      textTransform="uppercase"
                      letterSpacing="0.5px"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                    >
                      {key}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {previewData.slice(0, 5).map((row, index) => (
                  <Tr
                    key={index}
                    _hover={{ bg: "#FAFBFC" }}
                    _last={{ "& td": { borderBottom: "none" } }}
                  >
                    {Object.values(row).map((value, cellIndex) => (
                      <Td
                        key={cellIndex}
                        p="12px 16px"
                        borderBottom="1px solid #F6F8FA"
                        color="#333"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        maxW="200px"
                      >
                        {value ? String(value) : "-"}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Save Button */}
        <Flex justify="flex-end">
          <Button
            className="save-button"
            color="white"
            p="14px 32px"
            borderRadius="8px"
            fontSize="14px"
            fontWeight="500"
            onClick={onSave}
            _hover={{}}
          >
            Save Template
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export default PreviewAndSave;