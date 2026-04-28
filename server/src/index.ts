import express from "express";
import cors from "cors";
import { ASRClient, LLMClient, Config } from 'coze-coding-dev-sdk';

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

// System prompt - bilingual answer in one call
const systemPromptBilingual = `You are a professional assistant for ASIIN accreditation at Taizhou University, Computer Science and Technology program.

ABOUT: 泰州学院(13 colleges, 37 programs, 800+ teachers, 13500+ students)
学院: 信息工程学院(2014年成立, 4个专业)
专业: 2015本科招生, 2022省一流专业, 2023卓越工程师计划2.0

CURRICULUM: 模块1基础学科, 模块2专业课程, 模块3通识课程, 模块4综合实践
核心课程: C语言, 离散数学, 数据结构, 算法, 操作系统, 计算机网络, 软件工程, 人工智能

EDUCATIONAL GOALS: 培养应用型计算机工程人才, 12条毕业要求(ASIIN TC04)
EXAMS: 多样化考核方式
RESOURCES: 52名教职工(5教授/18副教授/26博士), 19个实验室(1522万元), 1门国家一流课程
QUALITY: 质量评估与改进体系
EMPLOYMENT: IT/生物医药/智能制造, 技术骨干或项目经理
MOBILITY: 江苏省国际化人才培养品牌专业

IMPORTANT: Answer in Chinese first, then English. Be specific, reference SAR data.`;

// Stream-based Voice Chat API - returns bilingual answers as SSE
app.post('/api/v1/chat/stream', async (req, res) => {
  try {
    const { audio } = req.body;
    
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!audio) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Missing audio' })}\n\n`);
      res.end();
      return;
    }

    const config = new Config();
    const asrClient = new ASRClient(config);
    const llmClient = new LLMClient(config);

    // Step 1: ASR
    const asrResult = await asrClient.recognize({ uid: 'user-001', base64Data: audio });
    const recognizedText = asrResult.text || '';

    if (!recognizedText.trim()) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: '无法识别语音' })}\n\n`);
      res.end();
      return;
    }

    // Send recognized question
    res.write(`data: ${JSON.stringify({ type: 'question', content: recognizedText })}\n\n`);

    // Step 2: Generate bilingual answer in ONE call
    const messages = [
      { role: 'system' as const, content: systemPromptBilingual },
      { role: 'user' as const, content: recognizedText }
    ];

    for await (const chunk of llmClient.stream(messages, { 
      temperature: 0.7,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        res.write(`data: ${JSON.stringify({ type: 'answer', content: chunk.content.toString() })}\n\n`);
      }
    }

    // Done
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: '处理失败' })}\n\n`);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
