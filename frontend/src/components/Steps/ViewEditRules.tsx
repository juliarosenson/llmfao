import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
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
  Text,
  Textarea,
  useDisclosure,
  useToast,
  VStack
} from '@chakra-ui/react';
import React from 'react';
import { ColumnMapping, ColumnMappingsResponse } from '../../lib/prompt';

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

const getRuleTypeColor = (ruleType: string) => {
  switch (ruleType) {
    case 'Copy':
    case 'COPY':
      return 'blue';
    case 'Reformat':
    case 'REFORMAT':
      return 'orange';
    case 'Concatenate':
    case 'CONCATENATE':
      return 'purple';
    case 'Extract':
    case 'EXTRACT':
      return 'yellow';
    case 'Static':
    case 'STATIC':
      return 'green';
    case 'Blank':
    case 'BLANK':
      return 'red';
    default:
      return 'gray';
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


const ViewEditRules: React.FC<ViewEditRulesProps> = ({ rules, setRules, step, setStep, onContinue, sourceFields }) => {
  const [loading, setLoading] = React.useState(false);
  const [editingMapping, setEditingMapping] = React.useState<ColumnMapping | null>(null);
  const [selectedSourceField, setSelectedSourceField] = React.useState<string>('');
  const [selectedSourceFields, setSelectedSourceFields] = React.useState<string[]>([]);
  const [selectedRuleType, setSelectedRuleType] = React.useState<string>('');
  const [hardcodeValue, setHardcodeValue] = React.useState<string>('');
  const [reformatType, setReformatType] = React.useState<string>('');
  const [separatorValue, setSeparatorValue] = React.useState<string>(', ');
  const [transformationLogic, setTransformationLogic] = React.useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const rulesContainerRef = React.useRef<HTMLDivElement>(null);
  
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
    setSeparatorValue(', ');
    
    onOpen();
  };

  const handleApplyChanges = () => {
    if (editingMapping) {
      let updatedSourceFields: string[] = [];
      let updatedTransformationLogic = '';

      switch (selectedRuleType) {
        case 'Copy':
          updatedSourceFields = [selectedSourceField];
          updatedTransformationLogic = `Copy ${selectedSourceField} directly to ${editingMapping.target_column}`;
          break;
        case 'Concatenate':
          updatedSourceFields = selectedSourceFields;
          updatedTransformationLogic = `Combine ${selectedSourceFields.join(', ')} with separator "${separatorValue}"`;
          break;
        case 'Static':
          updatedSourceFields = [];
          updatedTransformationLogic = `Set to static value: "${hardcodeValue}"`;
          break;
        case 'Reformat':
          updatedSourceFields = [selectedSourceField];
          if (reformatType) {
            updatedTransformationLogic = `Convert ${selectedSourceField} to ${reformatType} format`;
          } else {
            updatedTransformationLogic = `Reformat ${selectedSourceField} for ${editingMapping.target_column}`;
          }
          break;
        case 'Extract':
          updatedSourceFields = selectedSourceFields;
          updatedTransformationLogic = `Extract portions from ${selectedSourceFields.join(', ')}`;
          break;
        case 'Blank':
          updatedSourceFields = [];
          updatedTransformationLogic = `Leave ${editingMapping.target_column} blank`;
          break;
        default:
          updatedSourceFields = [selectedSourceField];
          updatedTransformationLogic = `Process ${selectedSourceField} into ${editingMapping.target_column}`;
      }

      const updatedMapping: ColumnMapping = {
        ...editingMapping,
        type: selectedRuleType as ColumnMapping['type'],
        source_fields: updatedSourceFields,
        transformation_logic: updatedTransformationLogic,
        needs_attention: false,
      };

      console.log('Applying changes:', {
        mapping: editingMapping,
        updatedMapping: updatedMapping
      });

      const updatedRules = rules!.map((rule) =>
        rule.target_column === editingMapping.target_column ? updatedMapping : rule
      );
      
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

  const renderRuleConfiguration = () => {
    switch (selectedRuleType) {
      case 'Static':
        return (
          <FormControl mt={4}>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Static Value
            </FormLabel>
            <Input
              value={hardcodeValue}
              onChange={(e) => setHardcodeValue(e.target.value)}
              placeholder="Enter the value to use for all rows"
              bg="white"
              borderColor="gray.300"
            />
            
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mt={4}>
              Logic
            </FormLabel>
            <Textarea
              value={transformationLogic}
              onChange={(e) => setTransformationLogic(e.target.value)}
              placeholder="Describe the transformation logic"
              bg="white"
              borderColor="gray.300"
              minH="60px"
            />
          </FormControl>
        );
      
      case 'Reformat':
        return (
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Source Field
              </FormLabel>
              <Select
                value={selectedSourceField}
                onChange={(e) => setSelectedSourceField(e.target.value)}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
              >
                {getAllSourceFields().map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Format Type
              </FormLabel>
              <Select
                value={reformatType}
                onChange={(e) => setReformatType(e.target.value)}
                bg="white"
                borderColor="gray.300"
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
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Format Pattern
                </FormLabel>
                <Input
                  placeholder={
                    reformatType === 'date' ? 'e.g., MM/DD/YYYY, YYYY-MM-DD, DD/MM/YY' :
                    reformatType === 'phone' ? 'e.g., (XXX) XXX-XXXX, XXX-XXX-XXXX, +1-XXX-XXX-XXXX' :
                    reformatType === 'currency' ? 'e.g., $X,XXX.XX, €X.XXX,XX, X USD' :
                    'Describe your custom format (e.g., UPPERCASE, Title Case, etc.)'
                  }
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>
            )}
          </VStack>
        );
      
      case 'Concatenate':
        return (
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Source Fields to Combine
              </FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Select multiple fields to combine (hold Ctrl/Cmd to select multiple)
              </Text>
              <Select
                multiple
                value={selectedSourceFields}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedSourceFields(values);
                }}
                bg="white"
                borderColor="gray.300"
                minH="120px"
              >
                {getAllSourceFields().map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Separator
              </FormLabel>
              <Input
                value={separatorValue}
                onChange={(e) => setSeparatorValue(e.target.value)}
                placeholder="e.g., ', ' or ' - '"
                bg="white"
                borderColor="gray.300"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Logic
              </FormLabel>
              <Textarea
                value={transformationLogic}
                onChange={(e) => setTransformationLogic(e.target.value)}
                placeholder="Describe the transformation logic"
                bg="white"
                borderColor="gray.300"
                minH="60px"
              />
            </FormControl>
          </VStack>
        );
      
      case 'Extract':
        return (
          <VStack spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Source Fields
              </FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Select one or more fields to extract from (hold Ctrl/Cmd to select multiple)
              </Text>
              <Select
                multiple
                value={selectedSourceFields}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedSourceFields(values);
                }}
                bg="white"
                borderColor="gray.300"
                minH="120px"
                _hover={{ borderColor: "gray.400" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
              >
                {getAllSourceFields().map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Logic
              </FormLabel>
              <Textarea
                value={transformationLogic}
                onChange={(e) => setTransformationLogic(e.target.value)}
                placeholder="Describe what part to extract (e.g., Extract first letter of first name and first letter of last name from Donor Name field, concatenate with no space)"
                bg="white"
                borderColor="gray.300"
                minH="80px"
              />
            </FormControl>
          </VStack>
        );
      
      case 'Copy':
        return (
          <FormControl mt={4}>
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
              Source Field
            </FormLabel>
            <Select
              value={selectedSourceField}
              onChange={(e) => setSelectedSourceField(e.target.value)}
              bg="white"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
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
          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600" fontStyle="italic">
              This field will be left empty in the output.
            </Text>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
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
            Generating Preview...
          </Text>
        </VStack>
      </Box>
    )}

    <Box w="100%" maxW="1400px">
    <Box w="100%" mx="auto" mt={8} border="2px solid #38b6ff" borderRadius="lg" p={6}>
      <Text fontSize="xl" fontWeight="bold" mb={1}>
        Review Column Mappings
      </Text>
      <Text color="gray.600" mb={4}>
        AI has analyzed your data and generated transformation rules
        {rules.filter(r => r.needs_attention).length > 0 && (
          <Text as="span" color="red.600" fontWeight="bold" ml={2}>
            • {rules.filter(r => r.needs_attention).length} rule{rules.filter(r => r.needs_attention).length === 1 ? '' : 's'} need{rules.filter(r => r.needs_attention).length === 1 ? 's' : ''} review
          </Text>
        )}
      </Text>
      
      {/* Rule Type Stats */}
      <HStack spacing={6} mb={6} flexWrap="wrap">
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            {rules.filter(r => r.type === 'Copy').length}
          </Text>
          <Text fontSize="xs" color="gray.500">COPY</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            {rules.filter(r => r.type === 'Reformat').length}
          </Text>
          <Text fontSize="xs" color="gray.500">REFORMAT</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            {rules.filter(r => r.type === 'Concatenate').length}
          </Text>
          <Text fontSize="xs" color="gray.500">CONCATENATE</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            {rules.filter(r => r.type === 'Extract').length}
          </Text>
          <Text fontSize="xs" color="gray.500">EXTRACT</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            {rules.filter(r => r.type === 'Static').length}
          </Text>
          <Text fontSize="xs" color="gray.500">STATIC</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            {rules.filter(r => r.type === 'Blank').length}
          </Text>
          <Text fontSize="xs" color="gray.500">BLANK</Text>
        </Box>
      </HStack>
      </Box>

      <br />

      {/* All mappings sorted by target column */}
      <Box
        maxH="500px"
        overflowY="auto"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        p={4}
        mb={6}
        ref={rulesContainerRef}
      >
        {autoMappings
          .sort((a, b) => a.target_column.localeCompare(b.target_column))
          .map((mapping, idx) => {
            const ruleType = getRuleTypeLabel(mapping);
            const hasRule = !!mapping.type;
            
            return (
              <Box
                key={mapping.target_column}
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                p={5}
                mb={4}
                border="2px solid"
                borderColor={mapping.needs_attention ? "red.300" : (hasRule ? "gray.200" : "red.300")}
                _last={{ mb: 0 }}
              >
                <Flex align="flex-start" mb={3}>
                  <Box flex="1">
                    <HStack spacing={3} mb={2}>
                      <Text fontWeight="bold" fontSize="lg">{mapping.target_column}</Text>
                      {hasRule && ruleType ? (
                        <Badge 
                          colorScheme="blue" 
                          fontSize="xs" 
                          px={2} 
                          py={1}
                          textTransform="uppercase"
                          fontWeight="bold"
                        >
                          {ruleType.label}
                        </Badge>
                      ) : (
                        <Badge 
                          colorScheme="red" 
                          fontSize="xs" 
                          px={2} 
                          py={1}
                          textTransform="uppercase"
                          fontWeight="bold"
                        >
                          NEEDS INPUT
                        </Badge>
                      )}
                      <Text color="gray.500" fontSize="md">{getSourceLabel(mapping)}</Text>
                    </HStack>

                    {/* Logic Section */}
                    {mapping.transformation_logic && (
                      <Box mb={2}>
                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={1}>
                          Logic:
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {mapping.transformation_logic}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  
                  <HStack spacing={2}>
                    {mapping.needs_attention && (
                      <Badge 
                        colorScheme="red" 
                        fontSize="xs" 
                        px={3} 
                        py={1}
                        borderRadius="full"
                        fontWeight="bold"
                      >
                        Needs Review
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant={hasRule ? "outline" : "solid"}
                      colorScheme={hasRule ? "gray" : "blue"}
                      onClick={() => handleEditClick(mapping)}
                      flexShrink={0}
                    >
                      Edit
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            );
          })}
      </Box>

      <Flex justify="center" mt={10} gap={4}>
        <Button variant="outline" onClick={() => setStep(step - 1)}>
          ← Back to Upload
        </Button>
       <Button colorScheme="blue" onClick={handleContinue}>
          Continue to Preview →
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
            <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
              Rule
            </FormLabel>
            <Select
              value={selectedRuleType}
              onChange={(e) => setSelectedRuleType(e.target.value)}
              bg="white"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
            >
              <option value="">Select a rule type</option>
              {ruleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {ruleOptions.filter(o => o.value === selectedRuleType).length > 0 && (
              <Text fontSize="xs" color="gray.500" mt={1}>
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
          <Button colorScheme="blue" onClick={handleApplyChanges}>
            Apply Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
};

export default ViewEditRules;