import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import React from 'react';

const steps = [
  "File Set Up",
  "Review Rules",
  "Preview & Save"
];

interface TopBarProps {
  currentStep: number; // 1-based index
}

const TopBar: React.FC<TopBarProps> = ({ currentStep }) => (
  <Box 
    position="fixed" 
    left={0} 
    top={0} 
    h="100vh" 
    w="280px" 
    bg="gray.50" 
    borderRight="1px solid" 
    borderColor="gray.200"
    p={6}
    zIndex={1000}
  >
    <Text fontSize="xl" fontWeight="bold" mb={8} color="gray.800">
      Export Template
    </Text>
    
    <VStack spacing={4} align="stretch">
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <HStack
            key={step}
            p={4}
            borderRadius="md"
            bg={isCurrent ? "#12b4fa" : isCompleted ? "green.50" : "white"}
            color={isCurrent ? "white" : isCompleted ? "green.700" : "gray.700"}
            fontWeight={isCurrent ? "bold" : "semibold"}
            fontSize="md"
            boxShadow={isCurrent ? "md" : "sm"}
            transition="all 0.2s"
            border="1px solid"
            borderColor={isCurrent ? "#12b4fa" : isCompleted ? "green.200" : "gray.200"}
            spacing={3}
          >
            {isCompleted ? (
              <Box
                w={6}
                h={6}
                borderRadius="full"
                bg="green.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <CheckIcon w={3} h={3} color="white" />
              </Box>
            ) : (
              <Box
                w={6}
                h={6}
                borderRadius="full"
                bg={isCurrent ? "white" : "gray.300"}
                color={isCurrent ? "#12b4fa" : "white"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="sm"
                fontWeight="bold"
                flexShrink={0}
              >
                {stepNumber}
              </Box>
            )}
            <Text flex={1}>{step}</Text>
          </HStack>
        );
      })}
    </VStack>
  </Box>
);

export default TopBar;