import { Box, ChakraProvider } from '@chakra-ui/react';
import { useState } from 'react';
import Steps from './components/Steps/Steps';
import TopBar from './components/TopBar';
import Home from './components/Home';

function App() {
  const [step, setStep] = useState(1);
  const [showSteps, setShowSteps] = useState(false);

  const handleCreateTemplate = () => {
    setShowSteps(true);
    setStep(1);
  };

  const handleBackToHome = () => {
    setShowSteps(false);
    setStep(1);
  };

  return (
    <ChakraProvider>
      {showSteps ? (
        <>
          <TopBar currentStep={step} />
          <Box ml="280px" p={8}>
            <Steps step={step} setStep={setStep} onBackToHome={handleBackToHome} />
          </Box>
        </>
      ) : (
        <Home onCreateTemplate={handleCreateTemplate} />
      )}
    </ChakraProvider>
  );
}

export default App;
