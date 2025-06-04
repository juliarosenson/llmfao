import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
  

app.use(express.json());
app.use(cors());

interface PromptRequest {
  prompt: string;
  file?: Express.Multer.File;
}

app.post('/api/generate', upload.array('file'), async (req, res) => {
  try {
    const { prompt } = req.body as PromptRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Here you can add your OpenAI API call logic
    // This is a basic example - you'll need to modify based on your specific needs
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });

    console.log('OpenAI response:', completion.choices[0].message.content);
    
    // Clean up markdown code block formatting
    let cleanedResponse = completion.choices[0].message.content || '';
    cleanedResponse = cleanedResponse.replace(/^```(json|csv)\s*/, '').replace(/\s*```$/, '');
    
    res.json({
      response: cleanedResponse,
    });

    // // Use Claude's format:
    // const completion = await anthropic.messages.create({
    //     model: "claude-3-5-sonnet-20241022", // or claude-3-haiku-20240307, claude-3-opus-20240229
    //     max_tokens: 1000,
    //     messages: [{ role: "user", content: prompt }]
    // });

    // res.json({
    //   response: completion.content[0].type === 'text' ? completion.content[0].text : '',
    //   filesProcessed: files ? files.length : 0
    // });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 