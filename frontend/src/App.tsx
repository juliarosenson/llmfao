import { ChakraProvider, Container, Heading, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import TopBar from './components/TopBar';
import Steps from './components/Steps/Steps';

function App() {
  const [step, setStep] = useState(1);
  return (
    <ChakraProvider>
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="center">
          <TopBar currentStep={step} />
          <Steps step={step} setStep={setStep}/>
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;
