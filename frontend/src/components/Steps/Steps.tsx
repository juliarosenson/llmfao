import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import TopBar from '../TopBar';
import Upload from './Upload';
import ViewEditRules from './ViewEditRules';
import { ColumnMappingsResponse, submitFinalExportPrompt, submitPromptWithFile } from '../../lib/prompt';
import PreviewAndSave from './PreviewSave';

const STUB_DONATION_DATA = [
  {
    name: 'Mr. Joel and Mrs. June Smith',
    amount: '$100',
    purpose: 'In honor of Dave Johnson',
    userId: '123',
    email: 'joel@email.com',
    fund: 'The Donors Fund',
    opportunityId: 'opp123',
    accountId: 'acc123',
    accountName: 'Smith Family Foundation',
    address: '123 Main St',
    address2: 'Apt 4B',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    country: 'USA',
    phone: '(555) 123-4567',
    createdAt: '2024-01-15T10:00:00Z',    
  },
  {
    name: 'Ms. Jane Doe',
    amount: '$250',
    purpose: 'In memory of John Doe',
    userId: '456',
    email: 'example@give.com',
    fund: 'Community Fund',
    opportunityId: 'opp456',
    accountId: 'acc456',
    accountName: 'Doe Family Trust',
    address: '456 Elm St',
    address2: '',
    city: 'Shelbyville',
    state: 'IL',
    zip: '62565',
    country: 'USA',
    phone: '(555) 987-6543',
    createdAt: '2024-01-16T11:30:00Z', 
  }
];

export type Template = {
  name: string;
  fileNamePattern: string;
  rules: ColumnMappingsResponse;
}

interface StepsProps {
  step: number; // 1-based index for the current step
  setStep: (step: number) => void;
}

const Steps: React.FC<StepsProps> = ({ step, setStep }) => {
  // State for rules
  const [rules, setRules] = React.useState<ColumnMappingsResponse>();
  const [templateName, setTemplateName] = React.useState<string>()
  const [crmFile, setCrmFile] = React.useState<File | null>(null);
  const [fileNamePattern, setFileNamePattern] = React.useState<string>('export_Start Date_End Date');
  const [csvPreview, setCsvPreview] = React.useState<string>('');

  // Handler for going back from Upload
  const handleBack = () => {
    setStep(step - 1);
  };

  // Handler for continuing from Upload
  const handleContinue = async () => {
    if (!crmFile) {
      alert('Please upload your CRM export sample.');
      return;
    }

    const rules = await submitPromptWithFile(
      JSON.stringify(STUB_DONATION_DATA),
      await crmFile.text(),
    )
    setRules(rules);
    setStep(step + 1);
  };

  // Handler for continuing from ViewEditRules
  const handlePreview = async () => {
    if (!rules) {
      alert('No rules available. Please generate rules first.');
      return;
    }

    const res = await submitFinalExportPrompt(
      rules,
      JSON.stringify(STUB_DONATION_DATA.slice(0, 3)),
    )
    console.log('Final export response:', res);
    setCsvPreview(res);
    setStep(step + 1);
  };

  return (
    <Flex>
      <Box w="100%" p={8}>
        {step === 1 && (
          <Upload
            setTemplateName={setTemplateName}
            templateName={templateName}
            fileNamePattern={fileNamePattern}
            setFileNamePattern={setFileNamePattern}
            crmFile={crmFile}
            setCrmFile={setCrmFile}
            onBack={handleBack}
            onContinue={handleContinue}
          />
        )}
        {step === 2 && <ViewEditRules 
        rules={rules} 
        step={step} 
        setStep={setStep}
        onContinue={handlePreview}
         />}
        {step === 3 && rules && <PreviewAndSave
          rules={rules}
          csvPreview={csvPreview}
          onBack={() => setStep(2)}
          onSave={() => {/* handle save */}}
          originalData={STUB_DONATION_DATA}
        />}
      </Box>
    </Flex>
  );
};

export default Steps; 