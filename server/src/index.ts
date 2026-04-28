import express from "express";
import cors from "cors";
import { ASRClient, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Voice Chat API - Process audio and return bilingual answers
app.post('/api/v1/chat/process', async (req, res) => {
  try {
    const { audio } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'Missing audio data' });
    }

    const config = new Config();
    const asrClient = new ASRClient(config);
    const llmClient = new LLMClient(config);

    // Step 1: Speech Recognition (ASR) - recognize English speech
    const asrResult = await asrClient.recognize({
      uid: 'user-001',
      base64Data: audio
    });

    const recognizedText = asrResult.text;
    console.log('ASR Result:', recognizedText);

    if (!recognizedText || recognizedText.trim() === '') {
      return res.status(400).json({ 
        error: 'Could not recognize speech',
        questionCN: '',
        questionEN: '',
        answerCN: '抱歉，我无法识别您的语音，请重试。',
        answerEN: 'Sorry, I could not recognize your speech. Please try again.'
      });
    }

    // Step 2: Generate answers using LLM
    // System prompt for ASIIN certification context
    const systemPrompt = `You are a professional assistant for ASIIN certification discussions. 
Please answer questions in both Chinese and English.
First provide the Chinese answer, then the English answer.
Keep answers clear, concise, and professional.
If the question is in English, still provide both Chinese and English answers.`;

    // Generate Chinese answer
    const cnMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: recognizedText }
    ];

    let answerCN = '';
    for await (const chunk of llmClient.stream(cnMessages, { 
      temperature: 0.7,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        answerCN += chunk.content.toString();
      }
    }

    // Generate English answer
    const enSystemPrompt = `You are a professional assistant for ASIIN certification discussions.
Please answer questions professionally and clearly in English.`;

    const enMessages = [
      { role: 'system' as const, content: enSystemPrompt },
      { role: 'user' as const, content: recognizedText }
    ];

    let answerEN = '';
    for await (const chunk of llmClient.stream(enMessages, {
      temperature: 0.7,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        answerEN += chunk.content.toString();
      }
    }

    console.log('LLM Responses generated successfully');

    res.status(200).json({
      questionEN: recognizedText,
      questionCN: recognizedText, // ASR recognized English, so both are same
      answerCN: answerCN.trim(),
      answerEN: answerEN.trim()
    });

  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      questionCN: '',
      questionEN: '',
      answerCN: '处理过程中出现错误，请重试。',
      answerEN: 'An error occurred during processing. Please try again.'
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
