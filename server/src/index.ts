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

// Complete reference Q&A from official documents - with original English answers
const referenceQA = `【教师认证问答 - 完整内容】

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
答：本专业强调应用型人才培养，既注重计算机科学基础理论，也强调工程实践、系统开发和岗位适应能力。目标是培养能够解决复杂工程问题的应用型工程技术人才。

Q7: 本专业如何体现可持续发展要求？
答：可持续发展体现在课程目标、工程伦理、系统设计和实践项目中。学生在设计解决方案时，需要考虑健康与安全、生命周期成本、净零碳要求、法律伦理、社会文化和环境影响等因素。《工程伦理》以及相关专业课程会引导学生理解技术应用对社会和环境的影响。

Q8: 如何培养学生的沟通能力？
答：沟通能力通过课程报告、项目答辩、小组讨论、专业英语、科技论文写作、毕业设计答辩和实习报告等环节培养。学生需要撰写技术文档、展示项目成果、回答教师或评委问题，并与小组成员进行协作沟通。这些训练支撑PLO9沟通能力。

Q9: 如何培养学生的项目管理能力？
答：项目管理能力主要通过软件工程、软件项目管理、课程设计、专业实习和毕业设计培养。学生在团队项目中需要进行需求分析、任务分解、进度安排、质量控制、文档管理和成果汇报，从而逐步理解工程项目管理方法。

Q10: 如何培养学生终身学习能力？
答：终身学习能力通过课程学习、开放性项目、文献检索、科技论文写作、毕业设计、学科竞赛和新技术课程培养。计算机技术更新很快，学生需要具备自主学习能力，能够持续跟踪人工智能、大数据、云计算、网络安全等新技术发展。

Q11: 专业如何培养学生工程伦理和职业规范？
答：通过《工程伦理》课程、思政类课程、专业课程案例、实习规范、毕业设计学术诚信要求等培养学生职业规范和工程伦理意识。学生需要理解数据安全、隐私保护、知识产权、软件合规、职业责任和社会影响等问题，并在工程实践中遵守相关法律法规和职业规范。

Q12: 本专业如何体现跨学科能力？
答：计算机应用本身具有跨学科特点。专业通过人工智能、智能医疗系统、机器人技术与应用、数据可视化、Web应用开发、软件工程项目等课程和项目，引导学生把计算机技术应用到医疗、制造、管理、服务等场景中。

Q13: 本专业如何进行招生质量分析？
答：专业通过招生率、录取人数、学生成绩分布、学业完成情况和毕业情况分析生源质量。自评报告中将招生、学习表现和毕业情况结合起来，形成"招生—培养—毕业"的质量分析链条。

Q14: 本专业如何保证录取过程公平？
答：学校按照普通高等学校招生工作规定和江苏省招生政策开展招生，实施招生"阳光工程"，坚持公开、公平、公正、综合评价和择优录取。

Q15: 培养方案修订有哪些参与者？
答：包括专业负责人、系主任、核心教师、教学督导、学院教学管理人员、行业企业专家、毕业生代表、用人单位代表等。

Q16: 学生和教师是否认可本专业能力目标？
答：总体认可。教师通过课程目标合理性确认、课程组研讨和教学大纲制定参与能力目标落实。学生通过课程学习、项目实践、实习和毕业设计逐步理解专业能力要求。

Q17: 劳动力市场是否认可本专业能力框架？
答：用人单位反馈和毕业生就业情况表明，本专业能力框架与IT行业和区域产业需求基本匹配。企业普遍重视学生的软件开发能力、系统设计能力、数据处理能力、团队协作能力和学习能力。

Q18: 如何说明专业名称与课程内容匹配？
答："计算机科学与技术"体现了科学基础与技术应用的结合。课程体系既包括计算理论、算法、系统结构等科学基础，也包括程序设计、数据库、软件工程、网络、人工智能、系统开发等技术应用内容。专业名称与培养目标、课程体系和就业方向是匹配的。

【学生座谈会问答 - 核心内容】

核心能力培养：
- 本专业主要培养应用型计算机工程技术人才
- 11项PLO：工程知识、问题分析、设计/开发解决方案、研究、使用现代工具、工程与可持续发展、工程伦理、职业规范、个人与团队、沟通、项目管理、终身学习
- 通过C程序设计培养独立完成小型系统开发能力
- 通过数据结构和算法设计与分析培养抽象问题、设计算法和分析复杂度的能力
- 通过软件工程和智能应用系统开发学习需求分析、系统设计、团队协作和项目管理

课程体系渐进性：
- 低年级：高等数学、线性代数、离散数学、Python编程、C语言编程
- 中年级：数据结构、数据库、计算机网络、计算机组成原理、操作系统、算法设计与分析
- 高年级：软件工程、人工智能、数据挖掘基础、机器学习、课程设计、专业实习、毕业设计

国际化视野：
- 江苏省高校国际化人才培养品牌专业
- 全英文课程教学
- 国际化师资队伍
- 提升学生国际视野和跨文化沟通能力

工程伦理理解：
- 在设计和开发系统时需要考虑系统安全、可靠性、隐私保护、可维护性、可持续性
- 通过工程伦理课程理解数据安全、隐私保护、知识产权、社会影响等问题

可持续发展：
- 课程中会考虑系统的安全性、可靠性、隐私保护、可维护性和可持续性`;

// English reference answers (from original documents)
const englishAnswers = `ASIIN is an international engineering education accreditation organization. Passing ASIIN accreditation means the program's curriculum, course system, and teaching quality meet international standards. Graduate degrees are internationally recognized, which helps students pursue further education abroad and find employment.

The six areas include: formalization/algorithms/mathematics, analysis and design/project management, technical competence, method transfer, interdisciplinary competence, and social competence. The 11 PLOs fully cover these six areas.

PLOs are the specific expression of the six competence areas in computer science. They are not conflicting but complementary. The 11 PLOs fully cover the six ASIIN SSC04 areas.

Course objectives connect to PLOs and training objectives through a three-layer matrix, forming a clear and traceable OBE system.

The training objectives follow a closed-loop process of research, demonstration, revision, and release. We refer to national professional standards, the university's applied-oriented positioning, and regional industry needs. We collect suggestions through industry surveys, graduate feedback, employer opinions, and faculty discussions.

The program emphasizes applied talent cultivation, focusing on both computer science theory and engineering practice. The goal is to cultivate applied engineering talents who can solve complex engineering problems.

Sustainability is reflected in course objectives, engineering ethics, system design, and practical projects. When students design solutions, we ask them to consider health and safety, lifecycle cost, net-zero carbon requirements, legal and ethical issues, social and cultural factors, and environmental impact.

We cultivate communication ability through course reports, project presentations, group discussions, Professional English, scientific writing, internship reports, and graduation thesis defenses. Students need to write technical documents, present their work, answer questions, and communicate with team members.

Project management ability is mainly cultivated through Software Engineering, Software Project Management, course projects, professional internships, and graduation design. In team projects, students need to analyze requirements, divide tasks, manage schedules, control quality, prepare documents, and present results.

Computer technology changes very fast, so lifelong learning is very important. We cultivate this ability through course learning, open-ended projects, literature search, scientific writing, graduation design, competitions, and courses on emerging technologies.

We cultivate these through Engineering Ethics, ideological and political courses, professional case studies, internship regulations, and academic integrity requirements for graduation design. Students need to understand data security, privacy protection, intellectual property, software compliance, professional responsibility, and social impact.

Computer applications are naturally interdisciplinary. Through courses and projects such as AI, intelligent healthcare systems, robotics, data visualization, web application development, and software engineering projects, students learn to apply computer technologies to different scenarios.

We analyze admission quality through admission rates, number of enrolled students, grade distribution, academic progress, and graduation results. We look at the whole chain from admission to education and graduation.

The university follows national and provincial admission regulations and implements the Sunshine Enrollment Project. The process follows the principles of openness, fairness, justice, comprehensive evaluation, and selective admission.

Participants include the program leader, department head, core faculty members, teaching supervisors, academic affairs staff, industry experts, graduate representatives, and employer representatives.

Yes, generally they do. Teachers participate through course objective reviews, course group discussions, and syllabus design. Students gradually understand the competence requirements through courses, projects, internships, and graduation design.

Employer feedback and graduate employment outcomes show that the competence framework matches the needs of the IT industry and regional development. Employers value software development, system design, data processing, teamwork, and learning abilities.

The name Computer Science and Technology reflects both scientific foundation and technological application. The curriculum includes computing theory, algorithms, system architecture, and also programming, databases, software engineering, networks, AI, and system development.

The program develops applied computer engineering talents with solid theoretical foundation, engineering practice ability, and teamwork skills. The 11 PLOs cover: engineering knowledge, problem analysis, design solutions, research, use modern tools, sustainable development, engineering ethics, professional standards, individual and teamwork, communication, project management, and lifelong learning.

Through C Programming, students develop ability to independently complete small system development. Through Data Structures and Algorithm Design, students learn to abstract problems, design algorithms, and analyze complexity.

The curriculum progresses from basic courses in lower years to specialized courses in middle years and comprehensive application in upper years. International perspective is cultivated through brand specialty designation, English courses, and international faculty.

When designing systems, students consider safety, reliability, privacy protection, maintainability, and sustainability. Engineering Ethics courses help students understand data security, privacy protection, intellectual property, and social impact.`;

// Simple English vocabulary
const englishVocab = `
Simple word guide for translation:
- 培养目标 → training objectives / goals
- 培养 → develop / train
- 工程实践 → engineering practice
- 课程体系 → courses / curriculum
- 团队协作 → teamwork
- 终身学习 → keep learning throughout life
- 教学质量 → teaching quality
- 产教融合 → combine education with industry
- 多元化考核 → different ways to test students
- 能力目标 → abilities
- 理论基础 → theory knowledge
- 工程伦理 → engineering ethics
- 可持续发展 → sustainable development
- 跨学科 → interdisciplinary`;

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

【重要规则】：
1. 首先在【参考答案】中查找是否有完全匹配或高度相关的问答
2. 如果有，必须严格按照参考答案回答，不要发挥
3. 只有当参考答案中没有相关信息时，才根据专业建设的一般情况回答
4. 只用中文回答

【参考答案】：
${referenceQA}` },
      { role: 'user' as const, content: recognizedText }
    ];

    let cnAnswer = '';
    for await (const chunk of llmClient.stream(cnMessages, { 
      temperature: 0.1,
      model: 'doubao-seed-1-6-251015'
    })) {
      if (chunk.content) {
        cnAnswer += chunk.content.toString();
        res.write(`data: ${JSON.stringify({ type: 'answer_cn', content: chunk.content.toString() })}\n\n`);
      }
    }

    // Translate to English - use simple words
    const enMessages = [
      { role: 'system' as const, content: `Translate Chinese to English using simple words:
- 培养 → develop / train
- 课程 → course
- 团队 → team
- 沟通 → communicate / talk
- 国际化 → international
- 可持续发展 → sustainable development
- 工程伦理 → engineering ethics
- 项目管理 → project management
- 终身学习 → keep learning
Use short sentences. Keep meaning exactly the same.` },
      { role: 'user' as const, content: cnAnswer }
    ];

    let enAnswer = '';
    for await (const chunk of llmClient.stream(enMessages, { 
      temperature: 0.1,
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
