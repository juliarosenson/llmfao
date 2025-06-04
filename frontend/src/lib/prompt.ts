import axios from 'axios';

// Rule types
type RuleType = "direct" | "reformat" | "combine" | "separate" | "conditional" | "hardcode";

interface DirectRule {
  type: "direct";
  sourceField: string;
  configuration: Record<string, unknown>;
}

interface ReformatRule {
  type: "reformat";
  sourceField: string;
  configuration: {
    formatType: string;
    currencySymbol?: string;
    dateFormat?: string;
    phoneFormat?: string;
  };
}

interface CombineRule {
  type: "combine";
  sourceField: string[];
  configuration: {
    sourceFields: string[];
    separator: string;
  };
}

interface SeparateRule {
  type: "separate";
  sourceField: string;
  configuration: {
    separationType: string;
    nameHandling: string;
    separator: string;
    removeTitle: boolean;
  };
}

interface ConditionalRule {
  type: "conditional";
  sourceField: null;
  configuration: {
    conditionField: string;
    conditions: Array<{
      condition: string;
      value: number;
      output: string;
    }>;
    fallback: string;
  };
}

interface HardcodeRule {
  type: "hardcode";
  sourceField: null;
  configuration: {
    value: string;
  };
}
export type Rule =
  | DirectRule
  | ReformatRule
  | CombineRule
  | SeparateRule
  | ConditionalRule
  | HardcodeRule;

// Suggestion type
export interface Suggestion {
  id: string;
  type: RuleType;
  description: string;
  sourceField: string | null;
  configuration: Record<string, unknown>;
  preview: {
    input: string;
    output: string;
  };
}

// The full mapping type
export interface ColumnMapping {
  targetColumn: string;
  rule: Rule | null;
  suggestions: Suggestion[];
}

// The response is an array of these:
export type ColumnMappingsResponse = ColumnMapping[];

function createRulesPrompt(source: string, target: string) {
  return `
You are an expert at analyzing donation data and generating export mappings for CRM systems. 
You are tasked with analyzing two data formats and creating transformation rules 
to convert from the source format to the target format.

Source Data Format (JSON)
${source}

Target Data Format (CSV)
${target}

Generate an array of objects with this structure:
[
  {
    "targetColumn": "CRM column name",
    "rule": { transformation rule } OR null,
    "suggestions": [ array of options ] OR []
  }
]
DECISION LOGIC:
Confident mapping → Create "rule" object, set "suggestions": []
Unclear/ambiguous → Set "rule": null, provide 2-3 "suggestions"
RULE TYPES:
direct - Copy value exactly as-is
{
  "type": "direct",
  "sourceField": "email",
  "configuration": {}
}
reformat - Transform format (currency, dates, phone numbers)
{
  "type": "reformat", 
  "sourceField": "amount",
  "configuration": {
    "formatType": "currency|date|phone|uppercase|lowercase",
    "currencySymbol": "$",
    "dateFormat": "MM/DD/YYYY|YYYY-MM-DD",
    "phoneFormat": "(XXX) XXX-XXXX"
  }
}
combine - Concatenate multiple fields
{
  "type": "combine",
  "sourceField": ["address", "city", "state"],
  "configuration": {
    "sourceFields": ["address", "city", "state"],
    "separator": ", "
  }
}
separate - Split one field into multiple (especially names)
{
  "type": "separate",
  "sourceField": "name", 
  "configuration": {
    "separationType": "name",
    "nameHandling": "combine_first|primary_only",
    "separator": " and ",
    "removeTitle": true
  }
}
conditional - Set value based on content of another field
{
  "type": "conditional",
  "sourceField": null,
  "configuration": {
    "conditionField": "amount",
    "conditions": [
      {"condition": "greater_than", "value": 1000, "output": "Major Donor"},
      {"condition": "less_than", "value": 250, "output": "Regular"}
    ],
    "fallback": "Mid-level"
  }
}
hardcode - Same static value for all records
{
  "type": "hardcode",
  "sourceField": null,
  "configuration": {
    "value": "ONLINE2025"
  }
}
WHEN TO PROVIDE SUGGESTIONS:
Name fields that might need splitting (especially with titles like "Mr./Mrs." or multiple people)
Missing CRM columns that have no clear source field
Fields that could be mapped multiple ways (fund names to codes, etc.)
SUGGESTION FORMAT:
{
  "id": "unique_identifier",
  "type": "rule_type",
  "description": "Clear description for user",
  "sourceField": "field_name" OR null,
  "configuration": { /* same as rule configuration */ },
  "preview": {
    "input": "actual sample data",
    "output": "expected result"
  }
}
ANALYSIS APPROACH:
 Look for obvious direct matches (email → Email, phone → Phone)
Identify formatting needs (dates, currency, phone numbers)
Spot field combinations (address components)
Detect complex cases needing user input (names with titles, missing fields)
Use actual sample data values in all preview examples
REQUIREMENTS:
Map every target CRM column (either rule or suggestions)
Use realistic preview examples with actual source data
Provide 2-3 suggestions for ambiguous cases
Keep descriptions simple and non-technical

Generate the complete columnMappings array as valid JSON, ensuring every target column is addressed with either a confident rule or realistic suggestions with preview examples using the actual source data.
Do not include any additional text or explanations, just return the JSON array as a string WITHOUT markdown
`
}

export async function submitPromptWithFile(source: string, target: string) {
  const formData = new FormData();
  formData.append('prompt', createRulesPrompt(source, target));

  try {
    const response = await axios.post('http://localhost:30003/api/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status !== 200) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return  JSON.parse(response.data.response) as ColumnMappingsResponse;
  } catch (error) {
    throw error;
  }
}


function createFinalExportPrompt(
  rules: ColumnMappingsResponse,
    source: string
) {
  return `
Using the following rules, generate a CSV file with the specified columns and transformations.
${JSON.stringify(rules, null, 2)}

The final output should be a CSV file with the following columns:
  - ${rules.map(rule => rule.targetColumn).join('\n  - ')}
Each column should be populated according to the rules defined, applying any necessary transformations or combinations as specified.

Here is the source data in JSON format:
${source}


Do not include any additional text or explanations, just return the CSV content as a string.
  `
}

export async function submitFinalExportPrompt(rules: ColumnMappingsResponse, source: string) {
    const formData = new FormData();
    formData.append('prompt', createFinalExportPrompt(rules, source));
  
    try {
      const response = await axios.post('http://localhost:30003/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status !== 200) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      return  response.data.response;
    } catch (error) {
      throw error;
    }
  }