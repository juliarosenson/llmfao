import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import { ColumnMappingsResponse, submitFinalExportPrompt, submitPromptWithFile } from '../../lib/prompt';
import PreviewAndSaveComponent from './PreviewSave';
import Upload from './Upload';
import ViewEditRules from './ViewEditRules';
import { CHARIOT_DATA } from '../../data/chariot_data';

// Type definitions for better type safety
type ColumnMapping = ColumnMappingsResponse["columnMappings"][0];

export type Template = {
  name: string;
  fileNamePattern: string;
  rules: ColumnMappingsResponse["columnMappings"];
}

interface StepsProps {
  step: number; // 1-based index for the current step
  setStep: (step: number) => void;
  onBackToHome?: () => void;
}

const Steps: React.FC<StepsProps> = ({ step, setStep, onBackToHome }) => {
  // State for rules
  const [rules, setRules] = React.useState<ColumnMappingsResponse["columnMappings"]>();
  const [templateName, setTemplateName] = React.useState<string>('');
  const [crmFile, setCrmFile] = React.useState<File | null>(null);
  const [fileNamePattern, setFileNamePattern] = React.useState<string>('export_Start Date_End Date');
  const [previewData, setPreviewData] = React.useState<Record<string, any>[]>([]);

  // Handler for going back from Upload
  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      setStep(step - 1);
    }
  };

  // Handler for continuing from Upload
  const handleContinue = async () => {
    if (!crmFile) {
      alert('Please upload your CRM export sample.');
      return;
    }

    if (!templateName) {
      alert('Please enter a template name.');
      return;
    }

    try {
      const res = await submitPromptWithFile(
        JSON.stringify(CHARIOT_DATA),
        await crmFile.text(),
      );
      console.log('Generated res:', res);
      setRules(res.columnMappings);
      setStep(step + 1);
    } catch (error) {
      console.error('Error generating rules:', error);
      alert('An error occurred while generating rules. Please try again.');
    }
  };

  // Handler for continuing from ViewEditRules
  const handlePreview = async () => {
    if (!rules) {
      alert('No rules available. Please generate rules first.');
      return;
    }

    try {
      const res = await submitFinalExportPrompt(
        rules,
        JSON.stringify(CHARIOT_DATA),
      );

      const data = JSON.parse(res);
      console.log('Final export data:', data);

      setPreviewData(data);
      setStep(step + 1);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('An error occurred while generating preview. Please try again.');
    }
  };

  // Handler for saving template
  const handleSave = () => {
    // Implement your save logic here
    console.log('Saving template:', {
      name: templateName,
      fileNamePattern,
      rules
    });
    // You might want to call an API or save to local storage
    alert('Template saved successfully!');
  };

  return (
    <Flex>
      <Box w="100%" maxW={"1600px"} p={8}>
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

        {step === 2 && rules && (
          <ViewEditRules
            rules={rules}
            setRules={setRules}
            step={step}
            setStep={setStep}
            onContinue={handlePreview}
            sourceFields={Object.keys(CHARIOT_DATA[0])}
          />
        )}

        {step === 3 && rules && (
          <PreviewAndSaveComponent
            rules={rules}
            previewData={previewData}
            onBack={() => setStep(2)}
            onSave={handleSave}
            originalData={CHARIOT_DATA}
            templateName={templateName || ''}
            fileNamePattern={fileNamePattern}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Steps;