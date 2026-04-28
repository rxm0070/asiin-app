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

const programInfo = `泰州学院计算机科学与技术专业 - ASIIN认证座谈
学校信息: 13个学院, 37个本科专业, 800+教师, 13500+学生
学院: 信息工程学院(2014年成立, 含计算机/物联网/大数据/网络安全专业)
专业历史: 2015本科招生, 2022省一流专业, 2023卓越工程师计划2.0

课程体系: 基础学科/专业课程/通识课程/综合实践
核心课程: C语言, 离散数学, 数据结构, 算法, 操作系统, 计算机网络, 软件工程, 数据库, 人工智能
资源: 52名教职工(5教授/18副教授/26博士), 19个实验室(1522万元设备)
培养: 应用型计算机工程人才, 12条毕业要求(ASIIN TC04标准)
就业: IT/生物医药/智能制造领域
国际化: 江苏省国际化人才培养品牌专业
学生成果: 400+省级以上竞赛奖, 80+创新项目, 100+专利`;

// Stream-based API
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

    // ASR
    const asrResult = await asrClient.recognize({ uid: 'user-001', base64Data: audio });
    const recognizedText = asrResult.text || '';

    if (!recognizedText.trim()) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: '无法识别语音' })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ type: 'question', content: recognizedText })}\n\n`);

    // Generate Chinese answer
    const cnMessages = [
      { role: 'system' as const, content: `你是泰州学院计算机科学与技术专业的ASIIN认证座谈助手。

${programInfo}

回答规则:
1. 优先使用以上提供的信息来回答问题
2. 如果提供的信息无法完全回答问题，请在专业合理范围内给出可参考的答案，并在回答开头说明"根据专业建设的一般情况..."
3. 回答要专业、简洁、具体
4. 只用中文回答，不要包含英文` },
      { role: 'user' as const, content: recognizedText }
    ];

    let cnAnswer = '';
    for await (const chunk of llmClient.stream(cnMessages, { 
      temperature: 0.3,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        cnAnswer += chunk.content.toString();
        res.write(`data: ${JSON.stringify({ type: 'answer_cn', content: chunk.content.toString() })}\n\n`);
      }
    }

    // Translate to English - use simple, common words
    const enMessages = [
      { role: 'system' as const, content: `You are a professional translator. Translate Chinese text to English.

Rules:
1. Keep the meaning exactly the same
2. Use simple, common, everyday English words
3. Avoid rare words, academic jargon, and complex vocabulary
4. Use short sentences when possible
5. Only output the English translation, nothing else

Examples:
- "培养应用型计算机工程人才" → "Train applied computer engineering talents"
- "产教融合" → "Combine education with industry practice"
- "多样化考核" → "Use different ways to assess students"
- "终身学习" → "Keep learning throughout life"` },
      { role: 'user' as const, content: cnAnswer }
    ];

    let enAnswer = '';
    for await (const chunk of llmClient.stream(enMessages, { 
      temperature: 0.3,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        enAnswer += chunk.content.toString();
        res.write(`data: ${JSON.stringify({ type: 'answer_en', content: chunk.content.toString() })}\n\n`);
      }
    }

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
