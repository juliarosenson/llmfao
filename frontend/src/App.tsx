import { Box, ChakraProvider } from '@chakra-ui/react';
import { useState } from 'react';
import Steps from './components/Steps/Steps';
import TopBar from './components/TopBar';

function App() {
  const [step, setStep] = useState(1);
  return (
    <ChakraProvider>
      <TopBar currentStep={step} />
      <Box ml="280px" p={8}>
        <Steps step={step} setStep={setStep}/>
      </Box>
    </ChakraProvider>
  );
}

export default App;
