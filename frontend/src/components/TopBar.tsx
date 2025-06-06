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

const TopBar: React.FC<TopBarProps> = ({ currentStep }) => {
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&display=swap');

    .topbar-container * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        w="280px"
        bg="white"
        borderRight="1px solid #DBE0E5"
        p="24px"
        zIndex={1000}
        className="topbar-container"
      >
        <Text
          fontSize="18px"
          fontWeight="500"
          mb="24px"
          color="#333"
        >
          Export Template
        </Text>

        <VStack spacing="8px" align="stretch">
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <Box
                key={step}
                display="flex"
                alignItems="center"
                p="10px 16px"
                borderRadius="8px"
                bg={isCurrent ? "#35BBF4" : "#F6F8FA"}
                color={isCurrent ? "white" : "#666"}
                fontSize="14px"
                fontWeight="500"
                border={isCurrent ? "none" : "1px solid #DBE0E5"}
                transition="all 0.2s"
              >
                {isCompleted ? (
                  <Box
                    w="24px"
                    h="24px"
                    borderRadius="50%"
                    bg="#DBE0E5"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mr="12px"
                    fontSize="12px"
                    fontWeight="600"
                    flexShrink={0}
                  >
                    <CheckIcon w="10px" h="10px" />
                  </Box>
                ) : (
                  <Box
                    w="24px"
                    h="24px"
                    borderRadius="50%"
                    bg={isCurrent ? "white" : "#DBE0E5"}
                    color={isCurrent ? "#35BBF4" : "white"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mr="12px"
                    fontSize="12px"
                    fontWeight="600"
                    flexShrink={0}
                  >
                    {stepNumber}
                  </Box>
                )}
                <Text flex={1}>{step}</Text>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </>
  );
};

export default TopBar;