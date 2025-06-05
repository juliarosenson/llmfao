import axios from 'axios';
// The full mapping type
export interface ColumnMapping {
  rule_number: number;
  target_column: string;
  type: "Copy" | "Reformat" | "Concatenate" | "Extract" | "Static" | "Blank";
  source_fields: string[];
  transformation_logic: string;
  confidence: "High" | "Medium" | "Low";
  needs_attention: boolean;
  notes: string;
}
// The response is an array of these:
export type ColumnMappingsResponse = {
  columnMappings: ColumnMapping[];
  summary: {
    total_target_columns: number;
    total_rules_generated: number;
    target_crm: string;
    rules_by_type: {
      Copy: number;
      Reformat: number;
      Concatenate: number;
      Extract: number;
      Static: number;
      Blank: number;
    };
    confidence_breakdown: {
      high_confidence: number;
      medium_confidence: number;
      low_confidence: number;
      needs_attention_count: number;
    };
    review_required: number[];
  };
};
function getCRMTips(crm: string){
  switch (crm) {
    case 'salesforce':
      return `
      - Dates: Convert to yyyy-MM-dd format
      - Booleans: Use true/false (lowercase)
      - Currency: Remove $ symbols and commas, keep numeric values only
      `
    case 'raisers-edge':
      return `
      - Multiple Fields: Use extensions like PhoneNum00, PhoneNum01
      - Currency: Remove $ and commas, max 10 digits before decimal
      - Text: Replace line breaks with /n
      `
    case 'virtuous':
      return `
      - Dates: Use MM/DD/YYYY format only
      - Currency: Decimal numbers only, no symbols
      - Text: ASCII characters only, no Unicode or special characters
      `
    case 'admire':
      return `
      - Account Types: Use only Personal or Business
      - Booleans: Use True/False (capitalized)
      - Dates: ISO format with timezone (2025-06-03T04:00:00.000Z)
      - Names: For organizations containing "Inc", "Foundation", "Trust" put entire name in FirstName
      `
    case 'everyaction':
      return `
      - Text: Remove special characters (ampersands, symbols)
      - IDs: Ensure VAN IDs are properly formatted integers
      `;
    default:
      return ``;
  }
}
function createRulesPrompt(source: string, target: string, crm: string = 'other') {
  return `
### Task
Generate JSON transformation rules to map source CSV donation data into target CRM-compatible format. Create exactly one rule for each target column.
### Rule Types
- Copy: Transfer field unchanged from source to target
- Reformat: Change format (dates, phone numbers, casing, etc.)
- Concatenate: Combine multiple source fields into one target field
- Extract: Take portion of a source field (e.g., first name from full name)
- Static: Use hardcoded value regardless of source data
- Blank: Leave target field empty (to be populated later)
### Requirements
1. Complete Coverage: Every target column must have exactly one rule
2. Sequential Numbering: Rules numbered 1, 2, 3... with no gaps
3. Valid Sources: Referenced source fields must exist in provided source data
4. CRM Compliance: Apply formatting rules specific to the target CRM system
5. Detailed Logic: Include specific transformation instructions for implementation
6. Confidence Assessment: Rate each rule's reliability (0-100 scale)
### Confidence and Attention Guidelines
**Confidence Levels:**
- High: Exact field matches, direct copies with no transformation needed
- Medium: Reasonable field matches with standard format transformations
- Low: Partial matches requiring assumptions or complex transformations
**Needs Attention Flag:**
- Set to true for ALL Static and Blank rule types (always require human review)
- Set to true when making assumptions about field meanings or data interpretation
- Set to true for complex transformations that may need validation
- Set to false only for straightforward Copy operations and standard Reformat operations
### CRM-Specific Formatting Rules
${getCRMTips(crm)}
### Edge Case Handling
- No Matching Source: Use Static (with appropriate default) or Blank - set needs_attention to true
- Multiple Source Options: Choose the most complete and reliable field
- Unclear Formats: Make reasonable assumptions, set needs_attention to true, and document in notes
- Missing Required Data: Use Static with sensible defaults per CRM requirements - set needs_attention to true
Source Data Format (JSON)
${source}
Target Data Format (CSV)
${target}
Output Format
{
  "columnMappings": [
    {
      "rule_number": 1,
      "target_column": "target_field_name",
      "type": "Copy|Reformat|Concatenate|Extract|Static|Blank",
      "source_fields": ["source_field_1", "source_field_2"],
      "transformation_logic": "Detailed description of the transformation",
      "confidence": "High|Medium|Low",
      "needs_attention": false,
      "notes": "Any assumptions, edge cases, or clarifications"
    }
  ],
  "summary": {
    "total_target_columns": 0,
    "total_rules_generated": 0,
    "target_crm": "CRM_NAME",
    "rules_by_type": {
      "Copy": 0,
      "Reformat": 0,
      "Concatenate": 0,
      "Extract": 0,
      "Static": 0,
      "Blank": 0
    },
    "confidence_breakdown": {
      "high_confidence": 0,
      "medium_confidence": 0,
      "low_confidence": 0,
      "needs_attention_count": 0
    },
    "review_required": []
  }
}
Generate the complete columnMappings array as valid JSON, ensuring every target column is addressed with either a confident rule or realistic suggestions with preview examples using the actual source data.
Do not include any additional text or explanations, just return the JSON array as a string WITHOUT markdown
`
}
export async function submitPromptWithFile(source: string, target: string, crm: string = 'other') {
  const formData = new FormData();
  formData.append('prompt', createRulesPrompt(source, target, crm));
  try {
    const response = await axios.post('http://localhost:30003/api/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status !== 200) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return JSON.parse(response.data.response) as ColumnMappingsResponse;
  } catch (error) {
    throw error;
  }
}
function createFinalExportPrompt(
  rules: ColumnMappingsResponse["columnMappings"],
    source: string
) {
  return `
Using the following rules, generate a CSV file with the specified columns and transformations.
${JSON.stringify(rules, null, 2)}
The final output should be an array of JSON objects with the following keys:
  - ${rules.map(rule => rule.target_column).join('\n  - ')}
Each object's keys should be populated by row according to the rules defined, applying any necessary transformations or combinations as specified.
Use empty strings for any fields that do not have values or not defined in the rules.
Here is the source data in JSON format:
${source}
Do not include any additional text or explanations, just return the JSON array as a string.
  `
}
export async function submitFinalExportPrompt(rules: ColumnMappingsResponse["columnMappings"], source: string) {
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