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

// Reference Q&A from official documents
const referenceQA = `
=== 计算机科学与技术专业ASIIN认证问答参考资料 ===

【专业定位与目标】
- 培养目标按"调研-论证-修订-发布"闭环流程制定
- 参考国家专业标准、学校应用型办学定位、区域产业需求
- 通过行业企业调研、毕业生反馈、用人单位意见、教师研讨收集建议
- 培养应用型计算机工程技术人才：扎实理论基础、工程实践能力、团队协作、项目管理、社会责任感、终身学习能力

【PLOs与培养目标关系】
- 课程目标(最具体)→PLO(专业层面毕业能力)→培养目标(毕业后发展状态)
- 通过三层矩阵连接，形成清晰可追溯的OBE体系

【ASIIN SSC04对应】
- 六大能力领域：形式化/算法/数学、分析设计/项目管理、技术能力、方法迁移、跨学科、社会能力
- 11项PLO覆盖：工程知识、问题分析、设计/开发解决方案、研究、使用现代工具、可持续发展、工程伦理、个人与团队、沟通、项目管理、终身学习

【课程体系】
- 低年级：高等数学、线性代数、离散数学、Python编程、C语言编程 → 打好基础
- 中年级：数据结构、数据库、计算机网络、计算机组成原理、操作系统、算法 → 核心专业
- 高年级：软件工程、人工智能、数据挖掘基础、机器学习、课程设计、实习、毕业设计 → 综合应用

【教学质量】
- 4位省级以上教学名师，2位省级优秀基层教学组织
- 国家一流课程1门，省级一流/在线开放课程6门
- 产教融合课程、校企合作课程

【学生支持】
- 专业导论课、学业导师、辅导员
- 学业困难学生帮扶机制

【考试组织】
- 过程性评价与结果性评价结合
- 多元化考核：笔试、实验、项目、答辩

【实验室资源】
- 19个教学实验室，设备总值1522万元
- 覆盖基础/专业/创新实验

【就业与产教融合】
- 对接IT行业、生物医药、智能制造
- 课程嵌入职业标准，校企深度合作
- 培养目标需持续改进，根据反馈优化

【国际化】
- 江苏省高校国际化人才培养品牌专业
- 全英文课程、国际化师资
- 提升国际视野和跨文化沟通能力

【工程伦理与社会责任】
- 工程伦理课程、案例分析、课程项目、毕业设计
- 培养安全意识、可靠性、隐私保护意识
`;

const translateInstruction = `
翻译规则：
1. 保持原意完全一致
2. 使用简单、常见、易懂的英文单词
3. 避免生僻词汇和复杂语法
4. 短句为主，便于理解
5. 只输出英文翻译，不要其他内容

常见词对照：
- 培养目标 → educational objectives
- 课程体系 → curriculum
- 工程实践 → engineering practice
- 团队协作 → teamwork
- 终身学习 → lifelong learning
- 教学质量 → teaching quality
- 产教融合 → combine education with industry
- 多元化考核 → use different ways to assess
`;

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
      { role: 'system' as const, content: `你是泰州学院计算机科学与技术专业ASIIN认证座谈助手。

重要规则：
1. 当用户提问时，你必须首先在以下【参考资料】中查找是否有可以直接回答该问题的内容
2. 如果【参考资料】中有直接相关的内容，你必须严格按照参考资料中的原话/原意回答，不要自己发挥或扩展
3. 只有当【参考资料】中没有相关信息时，才根据专业建设的一般情况回答，并在开头说明"根据专业建设的一般情况..."
4. 回答要简洁、具体

【参考资料 - 请严格按照以下内容回答】:
${referenceQA}` },
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

    // Translate to English
    const enMessages = [
      { role: 'system' as const, content: translateInstruction },
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
