import React from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';

interface HomeProps {
  onCreateTemplate: () => void;
}

const templates = [
  {
    name: "Salesforce Export Template",
    crm: "Salesforce",
    rules: 12,
    created: "3 days ago",
    lastUsed: "yesterday"
  },
  {
    name: "Raiser's Edge Standard",
    crm: "Raiser's Edge",
    rules: 8,
    created: "1 week ago",
    lastUsed: "3 days ago"
  },
  {
    name: "DonorPerfect Quick Export",
    crm: "DonorPerfect",
    rules: 6,
    created: "2 weeks ago",
    lastUsed: "1 week ago"
  },
  {
    name: "HubSpot Contact Import",
    crm: "HubSpot",
    rules: 15,
    created: "5 days ago",
    lastUsed: "2 days ago"
  },
  {
    name: "Virtuous Donor Management",
    crm: "Virtuous",
    rules: 10,
    created: "1 month ago",
    lastUsed: "1 week ago"
  },
  {
    name: "Blackbaud CRM Standard",
    crm: "Blackbaud",
    rules: 18,
    created: "3 weeks ago",
    lastUsed: "4 days ago"
  }
];

const Home: React.FC<HomeProps> = ({ onCreateTemplate }) => {
  return (
    <Box p={8} maxW="1400px" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="xl" color="gray.800">
          Export Templates
        </Heading>
        <Button 
          bg="#12b4fa"
          color="white"
          size="md"
          onClick={onCreateTemplate}
          leftIcon={<Text fontSize="lg">+</Text>}
          _hover={{ bg: "#0ea5e9" }}
        >
          Create New Template
        </Button>
      </Flex>

      {/* Templates Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={6}>
        {templates.map((template, index) => (
          <GridItem key={index}>
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              p={6}
              _hover={{ boxShadow: "md" }}
              transition="box-shadow 0.2s"
            >
              <VStack align="stretch" spacing={4}>
                {/* Template Name */}
                <Heading size="md" color="gray.800">
                  {template.name}
                </Heading>

                {/* CRM and Rules Info */}
                <HStack spacing={4}>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="semibold">CRM:</Text> {template.crm}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="semibold">Rules:</Text> {template.rules}
                  </Text>
                </HStack>

                {/* Dates */}
                <VStack align="stretch" spacing={1}>
                  <Text fontSize="sm" color="gray.500">
                    Created {template.created} • Last used {template.lastUsed}
                  </Text>
                </VStack>

                {/* Action Buttons */}
                <HStack spacing={3}>
                  <Button 
                    bg="#12b4fa"
                    color="white"
                    size="sm"
                    onClick={onCreateTemplate}
                    _hover={{ bg: "#0ea5e9" }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    borderColor="gray.300"
                    color="gray.600"
                  >
                    Duplicate
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default Home; 