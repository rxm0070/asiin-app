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

// Complete reference Q&A from official documents
const referenceQA = `【教师认证问答 - 完整问答】：

Q1: ASIIN认证对专业的意义？
答：ASIIN是国际工程教育专业认证机构。通过ASIIN认证意味着专业培养方案、课程体系、教学质量达到国际标准，毕业生学历获得国际认可，有利于学生出国深造和就业。

Q2: 如何理解ASIIN SSC04六大能力领域？
答：六大领域包括：形式化/算法/数学基础、分析设计/项目管理、技术能力、方法迁移、跨学科能力、社会能力。本专业11项PLO完整覆盖这六大领域。

Q3: PLO和SSC04的关系？
答：PLO是六大能力领域在计算机专业的具体化。两者不是冲突关系，而是"高层能力框架"和"细化学习成果"的关系。11项PLO完整覆盖SSC04六大能力。

Q4: 课程目标与PLO的关系？
答：通过"课程目标-PLO-培养目标"三层矩阵连接，形成清晰可追溯的OBE体系。

Q5: 培养目标如何制定？
答：按"调研-论证-修订-发布"闭环流程制定。参考国家专业标准、学校应用型办学定位、区域产业需求，通过行业企业调研、毕业生反馈、用人单位意见、教师研讨收集建议。

Q6: 如何解释应用型定位？
答：本专业强调应用型人才培养，既注重计算机科学基础理论，也强调工程实践、系统开发和岗位适应能力。课程体系既有基础课程，也有实践环节。目标是培养能够解决复杂工程问题的应用型工程技术人才。

Q7: 如何体现可持续发展？
答：可持续发展体现在课程目标、工程伦理、系统设计和实践项目中。学生在设计解决方案时需要考虑健康与安全、生命周期成本、净零碳要求、法律伦理、社会文化和环境影响等因素。

Q8: 如何培养沟通能力？
答：通过课程报告、项目答辩、小组讨论、专业英语、科技论文写作、毕业设计答辩和实习报告等环节培养。学生需要撰写技术文档、展示项目成果、回答问题、与小组成员协作沟通。

Q9: 如何培养项目管理能力？
答：主要通过软件工程、软件项目管理、课程设计、专业实习和毕业设计培养。学生在团队项目中进行需求分析、任务分解、进度安排、质量控制、文档管理和成果汇报。

Q10: 如何培养终身学习能力？
答：通过课程学习、开放性项目、文献检索、科技论文写作、毕业设计、学科竞赛和新技术课程培养。引导学生跟踪人工智能、大数据、云计算、网络安全等新技术发展。

Q11: 如何培养工程伦理和职业规范？
答：通过《工程伦理》课程、思政类课程、专业课程案例、实习规范、毕业设计学术诚信要求等培养。学生需要理解数据安全、隐私保护、知识产权、软件合规、职业责任和社会影响等问题。

Q12: 如何体现跨学科能力？
答：计算机应用本身具有跨学科特点。通过人工智能、智能医疗系统、机器人技术、数据可视化、Web应用开发、软件工程项目引导学生把计算机技术应用到医疗、制造、管理、服务等场景。

Q13: 如何进行招生质量分析？
答：通过招生率、录取人数、学生成绩分布、学业完成情况和毕业情况分析生源质量。形成"招生—培养—毕业"的质量分析链条。

Q14: 如何保证录取公平？
答：学校按照招生工作规定和江苏省招生政策，实施招生"阳光工程"，坚持公开、公平、公正、综合评价和择优录取。

Q15: 培养方案修订有哪些参与者？
答：包括专业负责人、系主任、核心教师、教学督导、学院教学管理人员、行业企业专家、毕业生代表、用人单位代表等。

Q16: 学生和教师是否认可专业能力目标？
答：总体认可。教师通过课程目标合理性确认、课程组研讨和教学大纲制定参与能力目标落实。学生通过课程学习、项目实践、实习和毕业设计逐步理解专业能力要求。

Q17: 劳动力市场是否认可专业能力框架？
答：用人单位反馈和毕业生就业情况表明，专业能力框架与IT行业和区域产业需求基本匹配。企业普遍重视软件开发能力、系统设计能力、数据处理能力、团队协作能力和学习能力。

Q18: 如何说明专业名称与课程内容匹配？
答："计算机科学与技术"体现了科学基础与技术应用的结合。课程体系既包括计算理论、算法、系统结构等科学基础，也包括程序设计、数据库、软件工程、网络、人工智能、系统开发等技术应用内容。

【学生座谈会问答 - 核心问答】：

核心能力培养：
- 本专业主要培养应用型计算机工程技术人才，具备扎实理论基础、工程实践能力和跨领域协作能力
- 11项PLO：工程知识、问题分析、设计/开发解决方案、研究、使用现代工具、工程与可持续发展、工程伦理、职业规范、个人与团队、沟通、项目管理、终身学习
- 通过《C程序设计》培养独立完成小型系统开发能力
- 通过《数据结构》和《算法设计与分析》培养抽象问题、设计算法和分析复杂度的能力
- 通过《软件工程》和《智能应用系统开发》学习需求分析、系统设计、团队协作和项目管理

课程体系渐进性：
- 低年级：高等数学、线性代数、离散数学、Python编程、C语言编程
- 中年级：数据结构、数据库、计算机网络、计算机组成原理、操作系统、算法设计与分析
- 高年级：软件工程、人工智能、数据挖掘基础、机器学习、课程设计、专业实习、毕业设计

可持续发展理解：
- 课程中会考虑系统的安全性、可靠性、隐私保护、可维护性和可持续性
- 通过《工程伦理》课程、专业课程案例、课程项目和毕业设计理解工程技术对社会的影响

国际化视野：
- 江苏省高校国际化人才培养品牌专业
- 全英文课程教学
- 国际化师资队伍
- 提升学生国际视野和跨文化沟通能力

工程伦理理解：
- 在设计和开发系统时需要考虑系统安全、可靠性、隐私保护、可维护性、可持续性
- 通过《工程伦理》课程理解数据安全、隐私保护、知识产权、社会影响等问题`;

// Simple English vocabulary list
const englishVocab = `
常用词对照（请在翻译时使用这些简单词汇）：
- 培养目标 → training objectives / goals
- 培养 → develop / train / cultivate
- 工程实践 → engineering practice
- 课程体系 → courses / curriculum
- 团队协作 → teamwork
- 终身学习 → keep learning throughout life
- 教学质量 → teaching quality
- 产教融合 → combine education with industry
- 多元化考核 → different ways to test students
- 能力目标 → abilities we should develop
- 理论基础 → theory knowledge
- 工程伦理 → engineering ethics
- 可持续发展 → sustainable development
- 跨学科 → work with different fields
- 沟通能力 → communication skills
- 项目管理 → manage projects
- 问题解决 → solve problems
- 系统设计 → design systems
- 就业 → find jobs
- 国际化 → international`;

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

【重要规则 - 必须严格遵守】：
1. 用户提问时，首先在【参考答案】中查找是否有完全匹配或高度相关的问答
2. 如果【参考答案】中有相关内容，必须严格按照参考答案的原话/原意回答，不要自己发挥、扩展或添加新内容
3. 只有当【参考答案】中完全没有相关信息时，才根据专业建设的一般情况回答，并开头说明"根据专业建设的一般情况..."
4. 回答要简洁、具体
5. 只用中文回答

【参考答案】：
${referenceQA}` },
      { role: 'user' as const, content: recognizedText }
    ];

    let cnAnswer = '';
    for await (const chunk of llmClient.stream(cnMessages, { 
      temperature: 0.2,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        cnAnswer += chunk.content.toString();
        res.write(`data: ${JSON.stringify({ type: 'answer_cn', content: chunk.content.toString() })}\n\n`);
      }
    }

    // Translate to English - use simple words
    const enMessages = [
      { role: 'system' as const, content: `You are a translator. Translate the following Chinese text to English.

Rules:
1. Keep the meaning EXACTLY the same
2. Use simple, common, everyday English words only
3. Avoid rare words: use "use" not "utilize", "help" not "facilitate", "keep" not "maintain"
4. Use short, simple sentences
5. Only output the English translation, nothing else

Word guide:
- 培养目标 → training goals
- 培养 → develop / train
- 实践 → practice
- 课程 → course
- 体系 → system / structure
- 团队 → team
- 协作 → work together
- 沟通 → talk / communicate
- 终身学习 → keep learning
- 国际化 → international
- 工程伦理 → engineering ethics
- 可持续发展 → sustainable development
- 跨学科 → work across different fields` },
      { role: 'user' as const, content: cnAnswer }
    ];

    let enAnswer = '';
    for await (const chunk of llmClient.stream(enMessages, { 
      temperature: 0.2,
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
