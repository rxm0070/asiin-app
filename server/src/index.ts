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
    // System prompt for ASIIN certification context - Taizhou University, Computer Science
    const systemPromptCN = `You are a professional assistant for ASIIN accreditation quality audit discussions at Taizhou University (泰州学院), an applied undergraduate institution.

About Taizhou University:
- 泰州学院是位于江苏省泰州市的应用型本科院校
- 坚持以服务地方经济社会发展为导向
- 注重产教融合和实践能力培养

The discussion focuses on these key areas for Computer Science & Technology program:
- Educational goals (教育目标): 培养应用型工程技术人才
- Curriculum (课程设置): 紧密结合地方产业需求
- Course of studies (学习课程): 算法、数据结构、软件工程、数据库等
- Contents and methods of teaching (教学内容与方法): 理论与实践并重
- Counseling and support for students (学生辅导与支持): 学业指导和职业规划
- Organization of exams (考试组织): 多样化考核方式
- Study results (学习成果): 学生能力和就业质量
- Relevance for the labor market (就业相关性): 对接地方IT产业
- Student mobility (学生流动性): 国内外交流与合作

Please answer in Chinese. Keep answers clear, concise, professional, and specific to Taizhou University's Computer Science & Technology program.`;

    const systemPromptEN = `You are a professional assistant for ASIIN accreditation quality audit discussions at Taizhou University (泰州学院), an applied undergraduate university in Jiangsu Province, China.

About Taizhou University:
- Taizhou University is an applied undergraduate institution located in Taizhou, Jiangsu Province
- Committed to serving local economic and social development
- Emphasizes industry-education integration and practical ability cultivation

The discussion focuses on these key areas for Computer Science & Technology program:
- Educational goals: Cultivating applied engineering and technical talents
- Curriculum: Closely aligned with local industry needs
- Course of studies: Algorithms, data structures, software engineering, databases, etc.
- Contents and methods of teaching: Equal emphasis on theory and practice
- Counseling and support for students: Academic guidance and career planning
- Organization of exams: Diversified assessment methods
- Study results: Student competence and employment quality
- Relevance for the labor market: Connection with local IT industry
- Student mobility: Domestic and international exchanges

Please answer professionally and clearly in English, specifically about Taizhou University's Computer Science & Technology program.`;

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
