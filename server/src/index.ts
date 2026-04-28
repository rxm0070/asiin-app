import express from "express";
import cors from "cors";
import { ASRClient, LLMClient, Config } from 'coze-coding-dev-sdk';

const app = express();
const port = process.env.PORT || 9091;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Program info for context
const programInfo = `泰州学院计算机科学与技术专业 - ASIIN认证座谈
学校: 13个学院, 37个本科专业, 800+教师, 13500+学生
学院: 信息工程学院(2014年成立)
专业: 2015本科招生, 2022省一流专业, 2023卓越工程师计划2.0

课程: 基础学科/专业课程/通识课程/综合实践
核心: C语言, 离散数学, 数据结构, 算法, 操作系统, 计算机网络, 软件工程, AI

培养目标: 应用型计算机工程人才, 12条毕业要求(ASIIN TC04)
考试: 多样化考核
资源: 52名教职工(5教授/18副教授/26博士), 19个实验室(1522万元)
就业: IT/生物医药/智能制造
国际化: 江苏省国际化人才培养品牌专业`;

// Stream-based API - returns separate Chinese and English answers
app.post('/api/v1/chat/stream', async (req, res) => {
  try {
    const { audio } = req.body;
    
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

    // ASR - recognize speech
    const asrResult = await asrClient.recognize({ uid: 'user-001', base64Data: audio });
    const recognizedText = asrResult.text || '';

    if (!recognizedText.trim()) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: '无法识别语音' })}\n\n`);
      res.end();
      return;
    }

    // Send recognized question
    res.write(`data: ${JSON.stringify({ type: 'question', content: recognizedText })}\n\n`);

    // Generate Chinese answer
    const cnMessages = [
      { role: 'system' as const, content: `你是泰州学院计算机科学与技术专业的ASIIN认证座谈助手。请用纯中文回答问题，不要包含任何英文。

${programInfo}

回答要求：
- 只用中文回答
- 专业、简洁、具体
- 基于以上信息回答` },
      { role: 'user' as const, content: recognizedText }
    ];

    let cnAnswer = '';
    for await (const chunk of llmClient.stream(cnMessages, { 
      temperature: 0.7,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        cnAnswer += chunk.content.toString();
        res.write(`data: ${JSON.stringify({ type: 'answer_cn', content: chunk.content.toString() })}\n\n`);
      }
    }

    // Generate English answer
    const enMessages = [
      { role: 'system' as const, content: `You are an ASIIN accreditation assistant for Taizhou University's Computer Science & Technology program. Answer in English only.

About the program:
- Taizhou University, 13 colleges, 37 programs, 800+ teachers, 13500+ students
- College of Information Engineering (founded 2014)
- 2015 undergrad enrollment, 2022 Jiangsu first-class specialty, 2023 Outstanding Engineer Program 2.0

Curriculum: Basic/Specialized/General/Practical modules
Core courses: C, Discrete Math, Data Structures, Algorithms, OS, Networks, Software Engineering, AI

Goals: Applied CS engineers, 12 graduation requirements (ASIIN TC04)
Resources: 52 faculty (5 prof/18 assoc prof/26 PhDs), 19 labs (15.22M yuan)
Employment: IT/Biomedicine/Manufacturing
International: Jiangsu brand specialty for international talent cultivation

Answer professionally in English only.` },
      { role: 'user' as const, content: recognizedText }
    ];

    let enAnswer = '';
    for await (const chunk of llmClient.stream(enMessages, { 
      temperature: 0.7,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        enAnswer += chunk.content.toString();
        res.write(`data: ${JSON.stringify({ type: 'answer_en', content: chunk.content.toString() })}\n\n`);
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
