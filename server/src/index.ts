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
    // System prompt for ASIIN certification context - Computer Science & Technology
    const systemPromptCN = `You are a professional assistant for ASIIN accreditation quality audit discussions at a Computer Science and Technology program.

The discussion focuses on these key areas:
- Educational goals (教育目标)
- Curriculum (课程设置)
- Course of studies (学习课程)
- Contents and methods of teaching (教学内容与方法)
- Counseling and support for students (学生辅导与支持)
- Organization of exams (考试组织)
- Study results (学习成果)
- Relevance for the labor market (就业相关性)
- Student mobility (学生流动性)

Please answer in Chinese. Keep answers clear, concise, professional, and specific to Computer Science & Technology. Focus on software engineering, algorithms, data structures, databases, networks, operating systems, artificial intelligence, and related fields.`;

    const systemPromptEN = `You are a professional assistant for ASIIN accreditation quality audit discussions at a Computer Science and Technology program.

The discussion focuses on these key areas:
- Educational goals
- Curriculum
- Course of studies  
- Contents and methods of teaching
- Counseling and support for students
- Organization of exams
- Study results
- Relevance for the labor market
- Student mobility

Please answer professionally and clearly in English, focusing on Computer Science & Technology topics including software engineering, algorithms, data structures, databases, computer networks, operating systems, artificial intelligence, and software development practices.`;

    // Generate Chinese answer
    const cnMessages = [
      { role: 'system' as const, content: systemPromptCN },
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
    const enMessages = [
      { role: 'system' as const, content: systemPromptEN },
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
