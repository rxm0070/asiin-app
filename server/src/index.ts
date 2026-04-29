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

// Complete reference Q&A from official documents - all 18 teacher Q&A + 8 student Q&A
const referenceQA = `【计算机科学与技术专业教师认证问答 - 完整18个问答】

Q1：计算机科学与技术专业的培养目标是如何制定的？
答：本专业培养目标按照"调研—论证—修订—发布"的闭环流程制定。首先，专业依据国家本科专业质量标准、学校应用型办学定位以及区域经济社会发展需求，明确计算机科学与技术专业人才培养方向。其次，通过行业企业调研、毕业生跟踪反馈、用人单位意见、教师研讨等方式收集利益相关方意见。再次，由系主任、专业负责人和核心教师组成工作组，对培养目标和课程体系进行论证和修订。最后，经学院教学指导组织和学校相关委员会审议后发布实施。本专业面向IT行业、科研机构、企事业单位和公共服务部门，培养具有扎实理论基础、工程实践能力、团队协作能力、项目管理能力、社会责任感和终身学习能力的应用型人才。
English Answer: The objectives were developed through a closed-loop process of investigation, discussion, revision, and approval. We first referred to national standards, the university's application-oriented positioning, and regional industry needs. Then we collected feedback from enterprises, graduates, employers, and faculty members. Based on this, the department head, programme leader, and core teachers worked together to revise the objectives, which were then reviewed and approved by the college and university committees.

Q2：请简要介绍本专业的培养目标和PLOs，它们是如何制定的？
答：本专业培养目标是培养具备扎实数学、自然科学和计算机科学基础，具有工程实践能力、团队协作能力、工程管理能力、沟通能力、职业伦理、社会责任感和终身学习能力的应用型计算机工程技术人才。毕业生能够在IT行业、科研机构、企事业单位和公共服务部门从事系统分析、设计、开发、测试、管理与服务等工作。本专业PLOs分为11项，包括工程知识、问题分析、设计/开发解决方案、研究、使用现代工具、工程与可持续发展、工程伦理和职业规范、个人与团队、沟通、项目管理和终身学习。PLOs的制定广泛参考了国家专业标准、ASIIN SSC04能力要求、行业发展需求、毕业生反馈、用人单位反馈和教师教学经验，最终形成可教学、可评价、可持续改进的学习成果体系。
English Answer: The programme aims to train application-oriented computer engineering professionals with a solid foundation in mathematics, natural sciences, and computer science, as well as engineering practice, teamwork, communication, project management, ethics, social responsibility, and lifelong learning ability. The programme has 11 PLOs, including engineering knowledge, problem analysis, solution design, research, use of modern tools, sustainability, engineering ethics, teamwork, communication, project management, and lifelong learning. These PLOs were formulated based on national standards, ASIIN SSC04 requirements, industry needs, graduate feedback, employer feedback, and teachers' teaching experience.

Q3：如何理解课程目标、PLO和培养目标之间的关系？
答：课程目标是最具体的教学目标，说明一门课程结束后学生应该掌握什么知识和能力。PLO是专业层面的毕业学习成果，说明学生毕业时应达到的能力。培养目标是毕业后若干年学生应达到的发展状态。课程目标支撑PLO，PLO支撑培养目标。本专业通过三层矩阵把这三者连接起来，形成清晰可追溯的OBE体系。
English Answer: I would explain it as a three-level structure. Course objectives are the most specific: they describe what students should learn in a particular course. PLOs describe what students should be able to do when they graduate. Programme Educational Objectives describe what graduates are expected to achieve several years after graduation. So course objectives support PLOs, and PLOs support the long-term educational objectives. We use the three alignment matrices to make this relationship clear and traceable.

Q4：如何说明本专业与ASIIN SSC04的对应关系？
答：ASIIN SSC04提出六大能力领域，包括形式化、算法与数学能力，分析、设计、实现与项目管理能力，技术能力，方法与迁移能力，跨学科能力，社会能力与自我能力。本专业将这些高层次能力领域细化为11项PLO，并通过Objective-Module Matrix对应到课程模块。这样既保证完全覆盖ASIIN要求，又使能力要求更加具体、可教学和可评价。
English Answer: ASIIN SSC04 defines six broad competence areas, such as formal, algorithmic and mathematical competencies, design and implementation competencies, technological competencies, transfer competencies, interdisciplinary competencies, and social competencies. Our programme breaks these broad areas down into 11 more specific PLOs. Then we map the PLOs to curriculum modules through the Objective-Module Matrix. In this way, we cover the ASIIN requirements, while also making them easier to teach, assess, and improve.

Q5：为什么ASIIN是六大能力，而本专业是11项PLO？
答：ASIIN SSC04的六大能力是高层次能力框架，而本专业11项PLO是结合中国工程教育认证要求、学校应用型办学定位和计算机专业特点细化形成的可操作学习成果。两者不是冲突关系，而是"高层能力框架"和"细化学习成果"的关系。11项PLO完整覆盖SSC04六大能力，并进一步强调可持续发展、工程伦理、项目管理和终身学习等方面，有利于课程映射和量化评价。
English Answer: The six ASIIN competence areas are a high-level framework. Our 11 PLOs are a more detailed and operational version adapted to Chinese engineering education requirements, our university's application-oriented positioning, and the characteristics of computer science. They are not contradictory. The 11 PLOs fully cover the six ASIIN areas and make them easier to map to courses, assessments, and continuous improvement.

Q6：如何解释本专业的应用型定位？
答：本专业强调应用型人才培养，既注重计算机科学基础理论，也强调工程实践、系统开发和岗位适应能力。课程体系中既有数学、算法、系统等基础课程，也有软件工程、智能应用系统开发、专业实习、毕业设计等实践环节。目标是培养能够在计算机应用领域解决复杂工程问题的应用型工程技术人才。
English Answer: The programme is application-oriented because we not only teach computer science theories, but also emphasize engineering practice, system development, and workplace readiness. The curriculum includes foundational courses such as mathematics, algorithms, and computer systems, as well as practical components such as software engineering, intelligent application development, internships, and graduation design. Our goal is to train students who can solve complex engineering problems in computer application fields.

Q7：本专业如何体现可持续发展要求？
答：可持续发展体现在课程目标、工程伦理、系统设计和实践项目中。学生在设计解决方案时，需要考虑健康与安全、生命周期成本、净零碳要求、法律伦理、社会文化和环境影响等因素。《工程伦理》以及相关专业课程会引导学生理解技术应用对社会和环境的影响。
English Answer: Sustainability is reflected in course objectives, engineering ethics, system design, and practical projects. When students design solutions, we ask them to consider health and safety, lifecycle cost, net-zero carbon requirements, legal and ethical issues, social and cultural factors, and environmental impact. Courses such as Engineering Ethics and related professional courses help students understand the social and environmental impact of technology.

Q8：如何培养学生的沟通能力？
答：沟通能力通过课程报告、项目答辩、小组讨论、专业英语、科技论文写作、毕业设计答辩和实习报告等环节培养。学生需要撰写技术文档、展示项目成果、回答教师或评委问题，并与小组成员进行协作沟通。这些训练支撑PLO9沟通能力。
English Answer: We cultivate communication ability through course reports, project presentations, group discussions, Professional English, Scientific and Technical Writing, internship reports, and graduation thesis defenses. Students need to write technical documents, present their work, answer questions, and communicate with team members. These activities directly support PLO9, which focuses on communication.

Q9：如何培养学生的项目管理能力？
答：项目管理能力主要通过软件工程、软件项目管理、课程设计、专业实习和毕业设计培养。学生在团队项目中需要进行需求分析、任务分解、进度安排、质量控制、文档管理和成果汇报，从而逐步理解工程项目管理方法。
English Answer: Project management ability is mainly cultivated through Software Engineering, Software Project Management, course projects, professional internships, and graduation design. In team projects, students need to analyze requirements, divide tasks, manage schedules, control quality, prepare documents, and present results. Through these activities, they gradually understand basic engineering project management methods.

Q10：如何培养学生终身学习能力？
答：终身学习能力通过课程学习、开放性项目、文献检索、科技论文写作、毕业设计、学科竞赛和新技术课程培养。计算机技术更新很快，学生需要具备自主学习能力，能够持续跟踪人工智能、大数据、云计算、网络安全等新技术发展。课程和实践环节会引导学生使用文献、在线资源和开发工具进行自主学习。
English Answer: Computer technology changes very fast, so lifelong learning is very important. We cultivate this ability through course learning, open-ended projects, literature search, scientific writing, graduation design, competitions, and courses on emerging technologies. Students are encouraged to use literature, online resources, development tools, and new technologies independently, especially in AI, big data, cloud computing, and cybersecurity-related work.

Q11：专业如何培养学生工程伦理和职业规范？
答：通过《工程伦理》课程、思政类课程、专业课程案例、实习规范、毕业设计学术诚信要求等培养学生职业规范和工程伦理意识。学生需要理解数据安全、隐私保护、知识产权、软件合规、职业责任和社会影响等问题，并在工程实践中遵守相关法律法规和职业规范。
English Answer: We cultivate these through Engineering Ethics, ideological and political courses, professional case studies, internship regulations, and academic integrity requirements for graduation design. Students need to understand data security, privacy protection, intellectual property, software compliance, professional responsibility, and social impact. In engineering practice, they are expected to follow laws, regulations, and professional norms.

Q12：本专业如何体现跨学科能力？
答：计算机应用本身具有跨学科特点。专业通过人工智能、智能医疗系统、机器人技术与应用、数据可视化、Web应用开发、软件工程项目等课程和项目，引导学生把计算机技术应用到医疗、制造、管理、服务等场景中。团队项目和企业实践也要求学生理解应用领域需求，与不同背景人员沟通合作。
English Answer: Computer applications are naturally interdisciplinary. Through courses and projects such as AI, intelligent healthcare systems, robotics, data visualization, web application development, and software engineering projects, students learn to apply computer technologies to healthcare, manufacturing, management, and service scenarios. Team projects and enterprise practice also require students to understand domain needs and communicate with people from different backgrounds.

Q13：本专业如何进行招生质量分析？
答：专业通过招生率、录取人数、学生成绩分布、学业完成情况和毕业情况分析生源质量。自评报告中将招生、学习表现和毕业情况结合起来，形成"招生—培养—毕业"的质量分析链条，用于判断学生基础是否能够支撑PLO达成。
English Answer: We analyze admission quality through admission rates, number of enrolled students, grade distribution, academic progress, and graduation results. We look at the whole chain from admission to education and graduation to judge whether the students' academic foundation can support the achievement of the PLOs.

Q14：本专业如何保证录取过程公平？
答：学校按照普通高等学校招生工作规定和江苏省招生政策开展招生，实施招生"阳光工程"，坚持公开、公平、公正、综合评价和择优录取。招生过程接受上级主管部门、学校监督部门和社会监督。
English Answer: The university follows national and provincial admission regulations and implements the "Sunshine Enrollment Project". The process follows the principles of openness, fairness, justice, comprehensive evaluation, and selective admission. It is also supervised by higher authorities, the university's internal supervision departments, and the public.

Q15：培养方案修订有哪些参与者？
答：参与者包括专业负责人、系主任、核心教师、教学督导、学院教学管理人员、行业企业专家、毕业生代表、用人单位代表等。通过多方参与，可以保证培养方案既符合教育标准，也适应行业和区域发展需求。
English Answer: The participants include the programme leader, department head, core faculty members, teaching supervisors, academic affairs staff, industry experts, graduate representatives, and employer representatives. With this broad participation, the cultivation plan can meet educational standards and also respond to industry and regional development needs.

Q16：学生和教师是否认可本专业能力目标？
答：总体认可。教师通过课程目标合理性确认、课程组研讨和教学大纲制定参与能力目标落实。学生通过课程学习、项目实践、实习和毕业设计逐步理解专业能力要求。学生满意度调查、课程评价和毕业生反馈也能够反映对培养目标和能力培养的认可。
English Answer: Yes, generally they do. Teachers participate through course objective reviews, course group discussions, and syllabus design. Students gradually understand the competence requirements through courses, projects, internships, and graduation design. Student satisfaction surveys, course evaluations, and graduate feedback also show that the objectives are generally recognized.

Q17：劳动力市场是否认可本专业能力框架？
答：用人单位反馈和毕业生就业情况表明，本专业能力框架与IT行业和区域产业需求基本匹配。企业普遍重视学生的软件开发能力、系统设计能力、数据处理能力、团队协作能力和学习能力。企业反馈也会用于进一步加强工程实践、项目经验和新技术应用能力培养。
English Answer: Yes. Employer feedback and graduate employment outcomes show that the competence framework matches the needs of the IT industry and regional development. Employers value students' software development ability, system design ability, data processing ability, teamwork, and learning ability. Their feedback is also used to further improve engineering practice and new technology training.

Q18：如何说明专业名称与课程内容匹配？
答："计算机科学与技术"体现了科学基础与技术应用的结合。课程体系既包括计算理论、算法、系统结构等科学基础，也包括程序设计、数据库、软件工程、网络、人工智能、系统开发等技术应用内容。因此，专业名称与培养目标、课程体系和就业方向是匹配的。
English Answer: The name "Computer Science and Technology" reflects both scientific foundation and technological application. The curriculum includes computing theory, algorithms, system architecture, and also programming, databases, software engineering, networks, AI, and system development. The programme name matches the training objectives, curriculum system, and employment direction.

【学生座谈会问答材料 - 完整内容】

问题1：你认为本专业重点培养了哪些核心能力？
答：本专业主要培养应用型计算机工程技术人才。PLOs包括11个方面：工程知识、问题分析、设计/开发解决方案、研究、使用现代工具、工程与可持续发展、工程伦理和职业规范、个人与团队、沟通、项目管理和终身学习。通过C程序设计，学生独立完成小型系统开发；通过数据结构和算法设计与分析，培养抽象问题、设计算法和分析复杂度的能力；通过软件工程和智能应用系统开发，学习需求分析、系统设计、团队协作和项目管理。

问题2：你如何获取培养方案、培养目标、毕业要求和课程体系？
答：我们主要通过学校教学管理系统查看培养方案、课程安排和修读要求；每门课程的教学大纲中会说明课程目标、课程内容、考核方式以及支撑哪些毕业学习成果；课程开始时，任课教师会介绍课程目标、学习要求、考核比例和课程与专业能力培养之间的关系；学院也会通过班会、专业介绍、导师指导等方式帮助我们理解专业培养目标和课程体系。

问题3：入学前后你对本专业的理解有哪些变化？
答：入学前，认为计算机科学与技术专业就是学习编程、写代码。进入大学后，逐渐认识到这个专业不仅包括编程，还包括数学基础、计算机系统、算法设计、数据库、网络、操作系统、软件工程、人工智能等多个方面。特别是通过项目化教学和课程设计，我对专业的理解发生了明显变化。计算机专业更强调系统思维、工程实践和解决复杂问题的能力。

问题4：你认为本专业毕业后可以从事哪些工作？
答：毕业后可以在IT行业、科研机构、企事业单位和公共服务部门从事计算机应用相关工作，例如软件开发、系统设计、Web开发、移动应用开发、数据库管理、算法设计、数据处理与分析、人工智能应用开发、系统测试、网络管理和项目管理等岗位。随着工作经验积累，毕业生也可以成长为技术骨干、系统架构人员或项目管理人员。

问题5：你如何理解工程师的责任？
答：工程师不仅要掌握技术，更要有社会责任感和工程伦理意识。对于计算机专业来说，我们设计和开发的软件系统、数据系统、网络系统和人工智能应用都会影响用户、企业甚至社会运行。因此，在工程实践中，需要考虑系统的安全性、可靠性、隐私保护、可维护性和可持续发展问题。

问题6：课程体系是否层层递进、逻辑清晰？
答：是的。课程按照"基础知识—专业核心—综合应用—工程实践—持续发展"的逻辑逐步推进。低年级学习高等数学、线性代数、离散数学、Python程序设计、C程序设计等基础课程；中年级学习数据结构、数据库、计算机网络、操作系统、算法设计与分析等核心课程；高年级学习软件工程、人工智能、机器学习、智能应用系统开发等专业课程，以及课程设计、专业实习和毕业设计等实践环节。

问题7：课程体系如何支撑能力培养？
答：专业通过三层对齐关系保证课程体系支撑能力培养。课程与毕业要求支撑矩阵明确每门课程支撑哪些毕业学习成果；目标课程矩阵把11项毕业要求映射到相关课程模块；毕业要求与培养目标支撑矩阵说明各项学习成果如何支撑长期培养目标。数学和算法类课程支撑工程知识、问题分析和研究能力；软件工程、数据库等课程支撑系统设计和工程实践能力；团队项目培养协作和沟通能力。

问题8：专业如何培养学生国际化视野？
答：专业是江苏省高校国际化人才培养品牌专业，开设全英文课程，引进国际化师资。与澳大利亚麦考瑞大学、澳门城市大学等开展人工智能交流项目。学生可以参与国际交流项目，提升国际视野和跨文化沟通能力。

【专业基本情况数据】

师资队伍（计算机科学与技术专业）：
- 专任教师16人：正高2人、副高4人、讲师10人
- 博士学位：8人，硕士学位：8人
- 有境外学习经历教师：2人
- 科技副总：1人
- 人才称号：3人

课程与教材建设：
- 国家一流课程：1门
- 省级一流课程：5门
- 省级在线开放课程：2门
- 教学研究项目：71项
- 发表教学改革论文：412篇
- 授权发明专利/实用新型专利：89项

科研情况：
- 市厅级以上项目：127项
- 横向项目到账经费：1805.1万元
- 省级平台：1个，市级平台：4个
- 专业实验室：13个
- 教学仪器设备：1251台
- 生均教学仪器设备值：1.97万元

专业建设经费：
- 合计投入：1495.2万元
- 课程建设费：80万元
- 实验实训条件建设：980.2万元
- 教师发展与教学团队建设：123.8万元
- 教材资源开发：70万元
- 教育教学研究与改革：167.1万元
- 国内外教学交流合作：14.1万元
- 学生创新创业训练：60万元

学生培养数据（2025年）：
- 招生人数：201人
- 毕业生人数：88人
- 学位授予率：100%
- 考研录取人数：16人，考研率：18%
- 就业率：100%

学生科创实践：
- 学科竞赛获奖：325人次
- 大学生创新创业项目：168人次
- 学生专利：32项
- 每学年开展社会实践活动：40次

国际交流项目：
- 澳门暑期文化交流项目
- 与澳门城市大学人工智能交流项目
- 与澳大利亚麦考瑞大学人工智能交流项目
- 与澳大利亚麦考瑞大学人工智能课程项目

图书资源：
- 中文藏书：134452册
- 外文藏书：5176册
- 中文期刊：829种
- 外文期刊：36种
- 中文数据库：9个`;

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

    // Generate Chinese answer - STRICTLY follow reference Q&A
    const cnMessages = [
      { role: 'system' as const, content: `你是泰州学院计算机科学与技术专业ASIIN认证座谈会的智能助手。

【核心职责】：根据提供的参考问答资料，准确回答专家关于专业建设的问题。

【重要规则】：
1. 首先在【参考答案】中查找是否有完全匹配或高度相关的问题
2. 如果找到高度匹配的问答，必须严格按照参考答案回答，保持原意
3. 只有当参考答案中没有相关信息时，才根据专业建设的实际情况回答
4. 只用中文回答
5. 回答要清晰、有条理、专业

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

    // Translate to English - use simple everyday words
    const enMessages = [
      { role: 'system' as const, content: `Translate the following Chinese answer into clear, simple English.

IMPORTANT RULES:
- Use ONLY common, everyday English words (no technical jargon unless necessary)
- Keep sentences SHORT and SIMPLE
- Do NOT use italics or fancy formatting
- Keep the meaning EXACTLY the same as the original
- Do NOT add or remove information

Word replacement guide (use these simple words):
- 培养 → develop / train / grow
- 课程 → course / class
- 专业 → program / major
- 团队 → team
- 沟通 → talk / share ideas / communicate
- 国际化 → international / worldwide
- 可持续发展 → sustainable development / protect the environment
- 工程伦理 → engineering ethics / right and wrong in engineering
- 项目管理 → project management / plan and organize projects
- 终身学习 → keep learning all your life / never stop learning
- 毕业生 → graduates / students who finish the program
- 理论知识 → theory knowledge / book knowledge
- 实践能力 → practical skills / hands-on skills
- 创新能力 → creative abilities / come up with new ideas
- 就业 → get a job / find work
- 计算机科学与技术 → Computer Science and Technology
- ASIIN → ASIIN (keep as is, it's an international accreditation organization)

Example:
Chinese: "本专业培养学生解决复杂工程问题的能力"
Simple English: "This program trains students to solve complex engineering problems"

Now translate the following Chinese answer:` },
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
