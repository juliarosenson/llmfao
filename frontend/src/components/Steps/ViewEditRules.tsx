import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import React from 'react';
import { ColumnMapping, ColumnMappingsResponse } from '../../lib/prompt';
import chihuahuaChariotGif from '../../lib/chihuahua-chariot.gif';

interface ViewEditRulesProps {
  rules?: ColumnMappingsResponse["columnMappings"];
  setRules: (rules: ColumnMappingsResponse["columnMappings"]) => void;
  sourceFields: string[];
  step: number;
  setStep: (step: number) => void;
  onContinue?: () => Promise<void>;
}

interface RuleOption {
  value: string;
  label: string;
  description: string;
}

const ruleOptions: RuleOption[] = [
  {
    value: 'Copy',
    label: 'Copy',
    description: 'Keep the data exactly the same and map to new column name'
  },
  {
    value: 'Reformat',
    label: 'Reformat',
    description: 'Reformat data such as date, time, casing, phone number to match CRM requirements'
  },
  {
    value: 'Concatenate',
    label: 'Concatenate',
    description: 'Combine multiple fields into one'
  },
  {
    value: 'Extract',
    label: 'Extract',
    description: 'Map part of one field to a new field'
  },
  {
    value: 'Static',
    label: 'Static',
    description: 'Set to static value'
  },
  {
    value: 'Blank',
    label: 'Leave Blank',
    description: 'Leave this field empty'
  }
];

const getRuleTypeLabel = (mapping: ColumnMapping) => {
  if (!mapping.type) return null;
  switch (mapping.type) {
    case 'Copy':
      return { label: 'COPY', desc: 'copy as-is' };
    case 'Reformat':
      return { label: 'REFORMAT', desc: 'reformat data' };
    case 'Concatenate':
      return { label: 'CONCATENATE', desc: 'combine fields' };
    case 'Extract':
      return { label: 'EXTRACT', desc: 'extract portion' };
    case 'Static':
      return { label: 'STATIC', desc: 'hardcoded value' };
    case 'Blank':
      return { label: 'BLANK', desc: 'leave empty' };
    default:
      return { label: 'UNKNOWN', desc: '' };
  }
};

const getSourceLabel = (mapping: ColumnMapping) => {
  if (!mapping.source_fields || mapping.source_fields.length === 0) {
    return '';
  }
  if (mapping.source_fields.length === 1) {
    return mapping.source_fields[0];
  }
  return mapping.source_fields.join(' + ');
};

const ViewEditRules: React.FC<ViewEditRulesProps> = ({
  rules,
  setRules,
  step,
  setStep,
  onContinue,
  sourceFields
}) => {
  const [loading, setLoading] = React.useState(false);
  const [editingMapping, setEditingMapping] = React.useState<ColumnMapping | null>(null);
  const [selectedSourceField, setSelectedSourceField] = React.useState<string>('');
  const [selectedSourceFields, setSelectedSourceFields] = React.useState<string[]>([]);
  const [selectedRuleType, setSelectedRuleType] = React.useState<string>('');
  const [hardcodeValue, setHardcodeValue] = React.useState<string>('');
  const [reformatType, setReformatType] = React.useState<string>('');
  const [formatPattern, setFormatPattern] = React.useState<string>('');
  const [separatorValue, setSeparatorValue] = React.useState<string>(', ');
  const [transformationLogic, setTransformationLogic] = React.useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const rulesContainerRef = React.useRef<HTMLDivElement>(null);

  // Function to auto-update transformation logic based on rule type and source fields
  const updateTransformationLogic = React.useCallback(() => {
    if (!editingMapping || !selectedRuleType) return;

    let newTransformationLogic = '';

    switch (selectedRuleType) {
      case 'Copy':
        if (selectedSourceField) {
          newTransformationLogic = `Copy ${selectedSourceField} directly to ${editingMapping.target_column}`;
        }
        break;
      case 'Concatenate':
        if (selectedSourceFields.length > 0) {
          newTransformationLogic = `Combine ${selectedSourceFields.join(', ')} with separator "${separatorValue}"`;
        }
        break;
      case 'Static':
        if (hardcodeValue) {
          newTransformationLogic = `Set to static value: "${hardcodeValue}"`;
        }
        break;
      case 'Reformat':
        if (selectedSourceField) {
          if (formatPattern) {
            newTransformationLogic = `Convert ${selectedSourceField} to ${formatPattern} format`;
          } else if (reformatType) {
            newTransformationLogic = `Convert ${selectedSourceField} to ${reformatType} format`;
          } else {
            newTransformationLogic = `Reformat ${selectedSourceField} for ${editingMapping.target_column}`;
          }
        }
        break;
      case 'Extract':
        if (selectedSourceFields.length > 0) {
          newTransformationLogic = `Extract portions from ${selectedSourceFields.join(', ')}`;
        }
        break;
      case 'Blank':
        newTransformationLogic = `Leave ${editingMapping.target_column} blank`;
        break;
      default:
        if (selectedSourceField) {
          newTransformationLogic = `Process ${selectedSourceField} into ${editingMapping.target_column}`;
        }
    }

    setTransformationLogic(newTransformationLogic);
  }, [editingMapping, selectedRuleType, selectedSourceField, selectedSourceFields, separatorValue, hardcodeValue, reformatType, formatPattern]);

  // Auto-update transformation logic when relevant fields change
  React.useEffect(() => {
    updateTransformationLogic();
  }, [updateTransformationLogic]);

  if (!rules) {
    return (
      <Box p={8}>
        <Text fontSize="lg" color="gray.600">
          No rules available. Please upload your dataset first.
        </Text>
      </Box>
    );
  }

  const autoMappings = rules.filter(r => r.type);

  // Get all unique source fields from the mappings
  const getAllSourceFields = (): string[] => {
    return Array.from(sourceFields).sort();
  };

  const handleEditClick = (mapping: ColumnMapping) => {
    setEditingMapping(mapping);

    // Set the current source field and rule type
    setSelectedSourceField(mapping.source_fields?.[0] || '');
    setSelectedSourceFields(mapping.source_fields || []);
    setSelectedRuleType(mapping.type || '');
    setTransformationLogic(mapping.transformation_logic || '');

    // Reset other fields
    setHardcodeValue('');
    setReformatType('');
    setFormatPattern('');
    setSeparatorValue(', ');

    // For static rules, extract the value from transformation logic
    if (mapping.type === 'Static' && mapping.transformation_logic) {
      const match = mapping.transformation_logic.match(/Set to static value: "(.*)"/);
      if (match && match[1]) {
        setHardcodeValue(match[1]);
      }
    }

    onOpen();
  };

  const handleApplyChanges = () => {
    if (editingMapping) {
      let updatedSourceFields: string[] = [];

      switch (selectedRuleType) {
        case 'Copy':
          updatedSourceFields = [selectedSourceField];
          break;
        case 'Concatenate':
          updatedSourceFields = selectedSourceFields;
          break;
        case 'Static':
          updatedSourceFields = [];
          break;
        case 'Reformat':
          updatedSourceFields = [selectedSourceField];
          updateTransformationLogic();
          break;
        case 'Extract':
          updatedSourceFields = selectedSourceFields;
          break;
        case 'Blank':
          updatedSourceFields = [];
          break;
        default:
          updatedSourceFields = [selectedSourceField];
      }

      console.log('Updated mapping:', {
        ...editingMapping,
        type: selectedRuleType,
        source_fields: updatedSourceFields,
        transformation_logic: transformationLogic,
      });

      const updatedMapping: ColumnMapping = {
        ...editingMapping,
        type: selectedRuleType as ColumnMapping['type'],
        source_fields: updatedSourceFields,
        transformation_logic: transformationLogic,
        needs_attention: false,
      };

      const updatedRules = rules!.map((rule) =>
        rule.target_column === editingMapping.target_column ? updatedMapping : rule
      );

      console.log('Updated rules:', updatedRules);

      setRules(updatedRules);

      // Close modal first to prevent focus issues
      onClose();

      // Scroll to top of rules container after React re-render
      setTimeout(() => {
        if (rulesContainerRef.current) {
          rulesContainerRef.current.scrollTop = 0;
        }
      }, 100);

      toast({
        title: 'Mapping updated successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      if (onContinue) {
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

  // <FormLabel fontSize="14px" fontWeight="450" color="#333">
  const renderRuleConfiguration = () => {
    switch (selectedRuleType) {
      case 'Static':
        return (
          <FormControl mt={4}>
            <FormLabel fontSize="14px" fontWeight="450" color="#333">
              Static Value
            </FormLabel>
            <Input
              value={hardcodeValue}
              onChange={(e) => setHardcodeValue(e.target.value)}
              placeholder="Enter the value or logic to use for all rows"
              w="full"
              p="14px 16px"
              border="1px solid #DBE0E5"
              borderRadius="8px"
              fontSize="14px"
              bg="white"
              _focus={{
                outline: "none",
                borderColor: "#35BBF4",
                boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
              }}
            />
          </FormControl>
        );
      
      case 'Reformat':
        return (
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Source Field
              </FormLabel>
              <Select
                value={selectedSourceField}
                onChange={(e) => setSelectedSourceField(e.target.value)}
                w="full"
                border="1px solid #DBE0E5"
                borderRadius="8px"
                fontSize="14px"
                bg="white"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              >
                {getAllSourceFields().map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Format Type
              </FormLabel>
              <Select
                value={reformatType}
                onChange={(e) => setReformatType(e.target.value)}
                w="full"
                border="1px solid #DBE0E5"
                borderRadius="8px"
                fontSize="14px"
                bg="white"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              >
                <option value="">Select format type</option>
                <option value="date">Date</option>
                <option value="phone">Phone Number</option>
                <option value="currency">Currency</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            {reformatType && (
              <FormControl>
                <FormLabel fontSize="14px" fontWeight="450" color="#333">
                  Format Pattern
                </FormLabel>
                <Input
                  value={formatPattern}
                  onChange={(e) => setFormatPattern(e.target.value)}
                  placeholder={
                    reformatType === 'date' ? 'e.g., MM/DD/YYYY, YYYY-MM-DD, DD/MM/YY' :
                    reformatType === 'phone' ? 'e.g., (XXX) XXX-XXXX, XXX-XXX-XXXX, +1-XXX-XXX-XXXX' :
                    reformatType === 'currency' ? 'e.g., $X,XXX.XX, €X.XXX,XX, X USD' :
                    'Describe your custom format (e.g., UPPERCASE, Title Case, etc.)'
                  }
                  w="full"
                  p="14px 16px"
                  border="1px solid #DBE0E5"
                  borderRadius="8px"
                  fontSize="14px"
                  bg="white"
                  _focus={{
                    outline: "none",
                    borderColor: "#35BBF4",
                    boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                  }}
                />
              </FormControl>
            )}
          </VStack>
        );
      
      case 'Concatenate':
        return (
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Source Fields to Combine
              </FormLabel>
              <Text fontSize="12px" color="#666" mb={2}>
                Select multiple fields to combine
              </Text>
              <Flex justify="flex-end" mb={2}>
                <Button
                  variant="link"
                  size="sm"
                  color="#35BBF4"
                  fontSize="12px"
                  p={0}
                  h="auto"
                  mr={3}
                  onClick={() => setSelectedSourceFields(getAllSourceFields())}
                  _hover={{ textDecoration: "underline" }}
                >
                  Select All
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  color="#666"
                  fontSize="12px"
                  p={0}
                  h="auto"
                  onClick={() => setSelectedSourceFields([])}
                  _hover={{ textDecoration: "underline" }}
                >
                  Unselect All
                </Button>
              </Flex>
              <Box
                border="1px solid #DBE0E5"
                borderRadius="8px"
                p="12px"
                bg="white"
                maxH="150px"
                overflowY="auto"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              >
                <CheckboxGroup
                  value={selectedSourceFields}
                  onChange={(values) => setSelectedSourceFields(values as string[])}
                >
                  <Stack spacing={2} direction="column">
                    {getAllSourceFields().map((field) => (
                      <Checkbox key={field} value={field}>
                        {field}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </Box>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Separator
              </FormLabel>
              <Input
                value={separatorValue}
                onChange={(e) => setSeparatorValue(e.target.value)}
                placeholder="e.g., ', ' or ' - '"
                w="full"
                p="14px 16px"
                border="1px solid #DBE0E5"
                borderRadius="8px"
                fontSize="14px"
                bg="white"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Logic
              </FormLabel>
              <Textarea
                value={transformationLogic}
                onChange={(e) => setTransformationLogic(e.target.value)}
                placeholder="Describe the transformation logic"
                w="full"
                p="14px 16px"
                border="1px solid #DBE0E5"
                borderRadius="8px"
                fontSize="14px"
                bg="white"
                minH="60px"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              />
            </FormControl>
          </VStack>
        );
      
      case 'Extract':
        return (
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Source Fields
              </FormLabel>
              <Text fontSize="12px" color="#666" mb={2}>
                Select one or more fields to extract from
              </Text>
              <Flex justify="flex-end" mb={2}>
                <Button
                  variant="link"
                  size="sm"
                  color="#35BBF4"
                  fontSize="12px"
                  p={0}
                  h="auto"
                  mr={3}
                  onClick={() => setSelectedSourceFields(getAllSourceFields())}
                  _hover={{ textDecoration: "underline" }}
                >
                  Select All
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  color="#666"
                  fontSize="12px"
                  p={0}
                  h="auto"
                  onClick={() => setSelectedSourceFields([])}
                  _hover={{ textDecoration: "underline" }}
                >
                  Unselect All
                </Button>
              </Flex>
              <Box
                border="1px solid #DBE0E5"
                borderRadius="8px"
                p="12px"
                bg="white"
                maxH="150px"
                overflowY="auto"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              >
                <CheckboxGroup
                  value={selectedSourceFields}
                  onChange={(values) => setSelectedSourceFields(values as string[])}
                >
                  <Stack spacing={2} direction="column">
                    {getAllSourceFields().map((field) => (
                      <Checkbox key={field} value={field}>
                        {field}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="14px" fontWeight="450" color="#333">
                Logic
              </FormLabel>
              <Textarea
                value={transformationLogic}
                onChange={(e) => setTransformationLogic(e.target.value)}
                placeholder="Describe what part to extract (e.g., Extract first letter of first name and first letter of last name from Donor Name field, concatenate with no space)"
                w="full"
                p="14px 16px"
                border="1px solid #DBE0E5"
                borderRadius="8px"
                fontSize="14px"
                bg="white"
                minH="80px"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              />
            </FormControl>
          </VStack>
        );
      
      case 'Copy':
        return (
          <FormControl mt={4}>
            <FormLabel fontSize="14px" fontWeight="450" color="#333">
              Source Field
            </FormLabel>
            <Select
              value={selectedSourceField}
              onChange={(e) => setSelectedSourceField(e.target.value)}
              w="full"
              border="1px solid #DBE0E5"
              borderRadius="8px"
              fontSize="14px"
              bg="white"
              _focus={{
                outline: "none",
                borderColor: "#35BBF4",
                boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
              }}
            >
              {getAllSourceFields().map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'Blank':
        return (
          <Box mt={4} p="16px" bg="#F8FAFB" borderRadius="8px" border="1px solid #DBE0E5">
            <Text fontSize="14px" color="#666" fontStyle="italic">
              This field will be left empty in the output.
            </Text>
          </Box>
        );
      
      default:
        return null;
    }
  };
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&display=swap');

    .rules-container * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
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
            <Image
              src={chihuahuaChariotGif}
              alt="Loading animation"
              width="550px"
              height="400px"
              objectFit="fill"
            />
          </VStack>
        </Box>
      )}

      <Box className="rules-container" w="100%" maxW="1200px" mx="auto" p="32px 48px">
        {/* Back Button */}
        <Button
          variant="link"
          color="#35BBF4"
          fontSize="14px"
          mb="32px"
          p={0}
          h="auto"
          onClick={() => setStep(step - 1)}
          _hover={{ textDecoration: "underline" }}
        >
          <Text mr="8px">←</Text>
          Back
        </Button>

        {/* Page Title */}
        <Text
          fontSize="32px"
          fontWeight="500"
          mb="40px"
          color="#333"
        >
          Review Column Mappings
        </Text>

          {/* Summary Section */}
          <Box
            bg="#F8FAFB"
            border="1px solid #DBE0E5"
            borderRadius="8px"
            p="20px"
            mb="32px"
          >
            <Text
              fontSize="20px"
              fontWeight="500"
              mb="8px"
              color="#333"
            >
              Review Column Mappings
            </Text>
            <Text fontSize="14px" color="#666" mb="16px">
              AI has analyzed your data and generated transformation rules
              {rules.filter(r => r.needs_attention).length > 0 && (
                <Text as="span" color="#E57373" fontWeight="450" ml={2}>
                  • {rules.filter(r => r.needs_attention).length} rule{rules.filter(r => r.needs_attention).length === 1 ? '' : 's'} need{rules.filter(r => r.needs_attention).length === 1 ? 's' : ''} review
                </Text>
              )}
            </Text>

            {/* Rule Type Stats */}
            <HStack spacing="32px" mt="16px" flexWrap="wrap">
              <Box textAlign="center">
                <Text fontSize="24px" fontWeight="600" color="#35BBF4" mb="4px">
                  {rules.filter(r => r.type === 'Copy').length}
                </Text>
                <Text fontSize="12px" color="#666" textTransform="uppercase" letterSpacing="0.5px">
                  COPY
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="24px" fontWeight="600" color="#35BBF4" mb="4px">
                  {rules.filter(r => r.type === 'Reformat').length}
                </Text>
                <Text fontSize="12px" color="#666" textTransform="uppercase" letterSpacing="0.5px">
                  REFORMAT
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="24px" fontWeight="600" color="#35BBF4" mb="4px">
                  {rules.filter(r => r.type === 'Concatenate').length}
                </Text>
                <Text fontSize="12px" color="#666" textTransform="uppercase" letterSpacing="0.5px">
                  CONCATENATE
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="24px" fontWeight="600" color="#35BBF4" mb="4px">
                  {rules.filter(r => r.type === 'Extract').length}
                </Text>
                <Text fontSize="12px" color="#666" textTransform="uppercase" letterSpacing="0.5px">
                  EXTRACT
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="24px" fontWeight="600" color="#35BBF4" mb="4px">
                  {rules.filter(r => r.type === 'Static').length}
                </Text>
                <Text fontSize="12px" color="#666" textTransform="uppercase" letterSpacing="0.5px">
                  STATIC
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="24px" fontWeight="600" color="#35BBF4" mb="4px">
                  {rules.filter(r => r.type === 'Blank').length}
                </Text>
                <Text fontSize="12px" color="#666" textTransform="uppercase" letterSpacing="0.5px">
                  BLANK
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Rules List */}
          <VStack spacing="16px" align="stretch" mb="32px">
            {autoMappings
              .map((mapping) => {
                const ruleType = getRuleTypeLabel(mapping);
                const hasRule = !!mapping.type;

                return (
                  <Box
                    key={mapping.target_column}
                    border="1px solid #DBE0E5"
                    borderRadius="6px"
                    p="16px"
                    bg="white"
                    borderColor={mapping.needs_attention ? "#E57373" : "#DBE0E5"}
                    _hover={{ borderColor: "#35BBF4" }}
                  >
                    <Flex align="flex-start" justify="space-between" mb="12px">
                      <HStack spacing="12px">
                        <Text fontWeight="500" fontSize="16px" color="#333">
                          {mapping.target_column}
                        </Text>
                        {hasRule && ruleType && (
                          <Badge
                            bg="rgba(53, 187, 244, 0.1)"
                            color="#35BBF4"
                            fontSize="11px"
                            fontWeight="500"
                            textTransform="uppercase"
                            px="8px"
                            py="2px"
                            borderRadius="3px"
                          >
                            {ruleType.label}
                          </Badge>
                        )}
                        <Text color="#666" fontSize="14px">
                          {getSourceLabel(mapping)}
                        </Text>
                      </HStack>

                      <HStack spacing="8px">
                        {mapping.needs_attention && (
                          <Badge
                            bg="#FFF0F0"
                            color="#E57373"
                            border="1px solid #E57373"
                            fontSize="12px"
                            fontWeight="500"
                            textTransform="uppercase"
                            px="12px"
                            py="4px"
                            borderRadius="4px"
                          >
                            NEEDS REVIEW
                          </Badge>
                        )}
                        <Button
                          bg="none"
                          border="none"
                          color="#35BBF4"
                          p="4px 8px"
                          borderRadius="3px"
                          fontSize="12px"
                          fontWeight="450"
                          onClick={() => handleEditClick(mapping)}
                          _hover={{ bg: "#F8FAFB" }}
                          h="auto"
                          minH="auto"
                        >
                          Edit
                        </Button>
                      </HStack>
                    </Flex>

                    {mapping.transformation_logic && (
                      <Text fontSize="14px" color="#657482" mt="12px">
                        {mapping.transformation_logic}
                      </Text>
                    )}
                  </Box>
                );
              })}
          </VStack>

          {/* Continue Button */}
          <Flex justify="flex-end">
            <Button
              bg="linear-gradient(135deg, #35BBF4 0%, #2da8d8 100%)"
              color="white"
              p="14px 32px"
              borderRadius="8px"
              fontSize="14px"
              fontWeight="500"
              onClick={handleContinue}
              isDisabled={loading}
              _hover={{
                bg: "linear-gradient(135deg, #2da8d8 0%, #2596c4 100%)",
                transform: "translateY(-2px)"
              }}
              transition="all 0.3s ease"
            >
              Continue
            </Button>
          </Flex>
        </Box>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent maxW="600px">
          <ModalHeader>
            <Text fontSize="xl" fontWeight="600">
              Edit Column Mapping: {editingMapping?.target_column}
            </Text>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            {/* Rule Type Selection */}
            <FormControl mb={6}>
              <FormLabel fontSize="14px" fontWeight="450" color="#333" mb={2}>
                Rule
              </FormLabel>
              <Select
                value={selectedRuleType}
                onChange={(e) => setSelectedRuleType(e.target.value)}
                w="full"
                border="1px solid #DBE0E5"
                borderRadius="8px"
                fontSize="14px"
                bg="white"
                _focus={{
                  outline: "none",
                  borderColor: "#35BBF4",
                  boxShadow: "0 0 0 3px rgba(53, 187, 244, 0.1)"
                }}
              >
                <option value="">Select a rule type</option>
                {ruleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {ruleOptions.filter(o => o.value === selectedRuleType).length > 0 && (
                <Text fontSize="12px" color="#666" mt="4px">
                  {ruleOptions.find(o => o.value === selectedRuleType)?.description}
                </Text>
              )}
            </FormControl>

            {/* Rule-specific Configuration */}
            {renderRuleConfiguration()}

          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              bg="linear-gradient(135deg, #35BBF4 0%, #2da8d8 100%)"
              color="white"
              onClick={handleApplyChanges}
              _hover={{
                bg: "linear-gradient(135deg, #2da8d8 0%, #2596c4 100%)"
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewEditRules;