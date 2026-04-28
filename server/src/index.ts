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
    // System prompt for ASIIN certification context - Taizhou University CS&T Major
    const systemPromptCN = `You are a professional assistant for ASIIN accreditation quality audit at Taizhou University (泰州学院), Computer Science and Technology program.

ABOUT THE UNIVERSITY:
泰州学院是位于江苏省泰州市的应用型本科院校，计算机科学与技术专业隶属信息工程学院。

ABOUT THE PROGRAM - Key Facts:
- 2001年设立计算机应用技术专科，2015年获批本科招生
- 2022年获批江苏省一流专业建设点、江苏省高校国际化人才培养品牌专业
- 2023年获批江苏省卓越工程师教育培养计划2.0专业
- 师资：52名教职工（5教授、18副教授、26博士、产业教授2人）
- 课程：国家级一流课程1门、省级一流本科课程4门、省在线开放课程2门
- 平台：国家工信部专精特新产业学院——安全感知产业学院
- 实验室：19个教学实验室，设备总值1522万元
- 学生成果：400余项省级以上竞赛奖、80余项省级以上创新项目、100余项专利
- 就业方向：生物医药、信息技术、智能制造领域

ASIIN Discussion Topics:
- Educational goals (教育目标): 培养应用型计算机工程人才
- Curriculum (课程设置): 算法、数据结构、软件工程、数据库、计算机网络等
- Contents and methods of teaching (教学内容与方法): 理论与实践并重，产教融合
- Counseling and support for students (学生辅导与支持): 学业指导、职业规划
- Organization of exams (考试组织): 多样化考核
- Study results (学习成果): 竞赛获奖、专利、就业质量
- Relevance for the labor market (就业相关性): 对接地方IT产业
- Student mobility (学生流动性): 国际化培养

Please answer in Chinese based on the program information above. Keep answers professional and specific.`;

    const systemPromptEN = `You are a professional assistant for ASIIN accreditation quality audit at Taizhou University, Computer Science and Technology program.

ABOUT THE UNIVERSITY:
Taizhou University is an applied undergraduate institution in Taizhou, Jiangsu Province. The Computer Science and Technology program is under the School of Information Engineering.

ABOUT THE PROGRAM - Key Facts:
- 2001: Started as associate degree in Computer Application Technology
- 2015: Approved for undergraduate enrollment
- 2022: Approved as First-Class Specialty in Jiangsu Province; Brand Specialty for International Talent Cultivation
- 2023: Approved as Jiangsu Outstanding Engineer Education Program 2.0
- Faculty: 52 members (5 professors, 18 associate professors, 26 PhDs, 2 industry professors)
- Courses: 1 national first-class course, 4 provincial first-class courses, 2 provincial online open courses
- Platforms: National MIIT Specialized Industry College - Safety Perception Industry College
- Labs: 19 teaching labs, equipment worth 15.22 million yuan
- Student Achievements: 400+ provincial/national competition awards, 80+ innovation projects, 100+ patents
- Employment: Biomedicine, IT, Intelligent Manufacturing sectors

ASIIN Discussion Topics:
- Educational goals, Curriculum, Course of studies
- Contents and methods of teaching
- Counseling and support for students
- Organization of exams, Study results
- Relevance for the labor market, Student mobility

Please answer professionally in English based on the program information above.`;

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
