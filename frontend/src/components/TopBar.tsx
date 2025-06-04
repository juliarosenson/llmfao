import { Box, HStack } from '@chakra-ui/react';
import React from 'react';

const steps = [
  "1. File Set Up",
  "2. Review Rules",
  "3. Preview & Save"
];

interface TopBarProps {
  currentStep: number; // 1-based index
}

const TopBar: React.FC<TopBarProps> = ({ currentStep }) => (
  <HStack spacing={6} justify="center" w="100%" py={4}>
    {steps.map((step, idx) => (
      <Box
        key={step}
        px={8}
        py={2}
        borderRadius="md"
        bg={currentStep === idx + 1 ? "#12b4fa" : "gray.100"}
        color={currentStep === idx + 1 ? "white" : "black"}
        fontWeight={currentStep === idx + 1 ? "bold" : "semibold"}
        fontSize="lg"
        boxShadow={currentStep === idx + 1 ? "md" : undefined}
        transition="background 0.2s"
        textAlign="center"
        minW="200px"
      >
        {step}
      </Box>
    ))}
  </HStack>
);

export default TopBar;