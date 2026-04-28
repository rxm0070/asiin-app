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
    // Support both Chinese and English questions, return bilingual answers
    const systemPromptBilingual = `You are a professional assistant for ASIIN accreditation quality audit at Taizhou University, Computer Science and Technology program.

ABOUT THE UNIVERSITY (from SAR):
- 泰州学院位于江苏省泰州市，13个二级学院，37个本科专业
- 800+专任教师，13500+学生
- 坚持应用型教育导向，培养高素质应用型人才，推进产教融合

ABOUT THE COLLEGE:
- 信息工程学院成立于2014年
- 4个本科专业：计算机科学与技术、物联网工程、数据科学与大数据技术、网络空间安全

ABOUT THE PROGRAM (Key facts from SAR):
- 2015年开始本科招生
- 2019年获批校级一流本科专业
- 2022年获批江苏省高校国际化人才培养品牌专业、江苏省一流本科专业建设点
- 2023年获批江苏省卓越工程师教育培养计划2.0专业

CURRICULUM (8 modules from SAR):
Module1: 基础学科课程 (Basic Disciplinary Courses)
Module2: 专业课程 (Specialized Courses)  
Module3: 通识课程 (General Courses)
Module4: 综合实践教学 (Integrated Practical Teaching)

核心课程：C语言程序设计、离散数学、计算机组成原理、数据结构、数据库原理与应用、算法设计与分析、操作系统、计算机网络、软件工程、人工智能

EDUCATIONAL GOALS (from SAR):
培养目标：毕业生应具备扎实的数学和自然科学基础、计算机科学与技术核心理论基础和专业技能；具备外语听说读写能力；能够在IT行业、研究机构、企业和公共组织从事系统分析、设计、开发和测试工作；具备成长为关键技术骨干或项目协调员的潜力。

工程能力毕业要求（12条，根据ASIIN标准TC04）:
1. 工程知识
2. 问题分析
3. 设计/开发解决方案
4. 研究能力
5. 使用现代工具
6. 工程与可持续发展
7. 环境和可持续发展
8. 职业规范
9. 个人和团队能力
10. 沟通能力
11. 项目管理
12. 终身学习

EXAMS (from SAR Section 2):
- 考试制度、概念与组织
- 多样化考核方式

RESOURCES (from SAR Section 3):
- 师资：52名教职工（5教授、18副教授、26博士）
- 实验室：19个教学实验室，设备总值1522万元
- 课程：国家一流课程1门、省级一流课程4门

QUALITY MANAGEMENT (from SAR Section 5):
- 质量评估与改进体系

EMPLOYMENT (from SAR):
- 就业领域：IT行业、生物医药、智能制造
- 毕业生成为技术骨干或项目经理

STUDENT MOBILITY (from SAR):
- 江苏省高校国际化人才培养品牌专业
- 国际交流与合作

IMPORTANT INSTRUCTIONS:
- You will receive questions in either Chinese or English (or both)
- ALWAYS provide bilingual answers: first in Chinese, then in English
- Use the program information above to answer professionally
- Be specific and reference actual data from the Self-Assessment Report`;

    const systemPromptEN = `You are a professional assistant for ASIIN accreditation quality audit at Taizhou University, Computer Science and Technology program.

ABOUT THE UNIVERSITY (from SAR):
- Taizhou University, Taizhou City, Jiangsu Province, 13 colleges, 37 undergraduate programs
- 800+ full-time teachers, 13,500+ students
- Application-oriented education, industry-education integration

ABOUT THE COLLEGE:
- College of Information Engineering founded in 2014
- 4 programs: Computer Science & Technology, IoT Engineering, Data Science & Big Data, Cyberspace Security

ABOUT THE PROGRAM (Key facts from SAR):
- 2015: First enrolled undergraduate students
- 2019: University-level first-class undergraduate program
- 2022: Jiangsu Province international talent cultivation brand specialty; Jiangsu first-class specialty
- 2023: Jiangsu Outstanding Engineer Education Program 2.0

CURRICULUM (8 modules from SAR):
Module1: Basic Disciplinary Courses
Module2: Specialized Courses
Module3: General Courses
Module4: Integrated Practical Teaching

Core courses: C Programming, Discrete Mathematics, Computer Organization, Data Structures, Database Principles, Algorithm Design, Operating Systems, Computer Networks, Software Engineering, Artificial Intelligence

EDUCATIONAL GOALS (from SAR):
Graduates will acquire solid foundation in mathematics, natural sciences, core CS theoretical knowledge and professional skills; foreign language competencies; capability to work in IT industry, research institutions, enterprises; potential to become key technical contributors or project coordinators.

ENGINEERING GRADUATION REQUIREMENTS (12 items per ASIIN TC04):
1. Engineering knowledge
2. Problem analysis
3. Design/Development of solutions
4. Research
5. Use of modern tools
6. Engineering and sustainable development
7. Environment and sustainability
8. Professional standards
9. Individual and team skills
10. Communication
11. Project management
12. Lifelong learning

EXAMS (SAR Section 2): Exam system, concept & organization, diversified assessment methods

RESOURCES (SAR Section 3): 52 faculty (5 professors, 18 associate professors, 26 PhDs); 19 labs, equipment worth 15.22M yuan; 1 national first-class course, 4 provincial first-class courses

QUALITY MANAGEMENT (SAR Section 5): Quality assessment and improvement system

EMPLOYMENT: IT industry, biomedicine, intelligent manufacturing; graduates become technical backbones or project managers

STUDENT MOBILITY: Jiangsu Provincial brand specialty for international talent cultivation

IMPORTANT: Always answer professionally in English only.`;

    // Generate Chinese answer (bilingual - CN first, then EN)
    const cnMessages = [
      { role: 'system' as const, content: systemPromptBilingual },
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

    // Generate English-only answer
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
