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

// Complete reference Q&A - all 176 teacher Q&A + 8 student Q&A
const referenceQA = `【计算机科学与技术专业教师认证问答 - 完整176个问答】

Q19：专业如何利用 PLO 达成评价进行改进？
答：如果某项 PLO 达成度偏低，专业会分析其支撑课程、考核环节和学生表现，查找原因。例如可能是课程实践不足、考核方式不够匹配、学生基础薄弱或课程衔接不够紧密。随后，专业会采取措施，如调整课程内容、加强实验项目、优化课程顺序、改进考核方式或增加学习支持。
English Answer: If the achievement level of a PLO is relatively low, we analyze the supporting courses, assessment tasks, and student performance. The reasons may include insufficient practice, inappropriate assessment methods, weak student foundations, or poor course sequencing. Then we take measures such as adjusting course content, strengthening experiments, optimizing course order, improving assessment methods, or providing more learning support.

Q20：如何说明本专业特色？
答：本专业特色主要体现在应用型人才培养、工程实践导向、人工智能和数据应用方向拓展、校企合作、项目化教学和持续改进机制。课程体系既强调计算机基础理论，也重视工程项目和真实应用场景，目标是培养能够解决计算机应用领域复杂工程问题的应用型人才。
English Answer: The programme is characterized by application-oriented talent cultivation, engineering practice, AI and data application development, university-enterprise cooperation, project-based teaching, and continuous improvement. The curriculum emphasizes both computer science fundamentals and real engineering application scenarios.

Q21：教师是否参与培养方案修订？
答：参与。培养方案修订由专业负责人、系主任和核心教师组成工作组进行，教师根据课程教学经验、学生达成情况、行业发展和课程衔接提出意见。教师参与有助于保证培养方案的可实施性。
English Answer: Yes. The revision is carried out by a working group composed of the programme leader, department head, and core teachers. Teachers provide suggestions based on teaching experience, student achievement, industry development, and course connection. Their participation makes the plan more practical and implementable.

Q22：企业是否参与培养方案修订？
答：参与。专业通过企业调研、企业座谈、用人单位反馈、校企合作交流等方式了解行业需求，并邀请企业专家对课程体系和实践教学提出意见。企业参与能够提升培养方案与岗位需求的匹配度。
English Answer: Yes. We collect industry needs through enterprise surveys, enterprise meetings, employer feedback, and university-enterprise cooperation. We also invite enterprise experts to give suggestions on the curriculum and practical teaching. This helps improve the match between the programme and job market needs.

Q23：如何确保培养方案既稳定又能更新？
答：培养方案保持基本结构和培养目标稳定，同时根据技术发展、行业需求、学生反馈和评价结果进行周期性修订和局部调整。这样既保证学生培养过程连续稳定，又能及时回应人工智能、大数据、云计算等新技术发展。
English Answer: We keep the basic structure and educational objectives stable, but revise the plan periodically based on technological development, industry needs, student feedback, and evaluation results. This ensures continuity in student training while allowing us to respond to new developments such as AI, big data, and cloud computing.

Q24：如果专家问"本专业最大的优势是什么"，如何回答？
答：本专业的优势在于应用型定位清晰、课程体系完整、实践教学体系较系统、校企合作持续推进，并建立了较清晰的 OBE 对齐和持续改进机制。学生既能掌握计算机基础理论，又能通过课程项目、实习和毕业设计提升工程实践能力。
English Answer: I would say the biggest strength is that the programme has a clear application-oriented positioning, a complete curriculum system, a systematic practical teaching structure, strong university-enterprise cooperation, and a clear OBE-based continuous improvement mechanism. Students can learn both solid theory and practical engineering skills through courses, projects, internships, and graduation design.

Q25：如果专家问"还存在哪些不足"，如何回答？
答：可以客观回答：随着人工智能、大数据和软件工程技术快速发展，课程内容和实践平台仍需要持续更新；部分课程在项目集中阶段学生负担较重，需要进一步优化课程安排；校企合作项目的深度和覆盖面还可以继续拓展。学院已经通过课程体系修订、实践教学强化、教师企业实践和校企合作等措施持续改进。
English Answer: We would answer honestly. With the rapid development of AI, big data, and software engineering, some course content and practice platforms still need continuous updating. In some project-intensive semesters, students may also feel a heavier workload. In addition, the depth and coverage of university-enterprise cooperation can still be improved. The college is already addressing these issues through curriculum revision, stronger practical teaching, faculty enterprise practice, and deeper cooperation with enterprises.

Q26：如果专家问"为什么要申请 ASIIN 认证"，如何回答？
答：申请 ASIIN 认证是为了对标国际工程教育标准，进一步完善培养目标、PLO 体系、课程支撑矩阵、实践教学和质量保障机制。通过认证过程，可以帮助专业发现不足、改进课程体系、提升国际化水平和人才培养质量，也有助于学生和毕业生获得更好的国际认可。
English Answer: We apply for ASIIN accreditation to benchmark against international engineering education standards and further improve our educational objectives, PLO system, course-support matrices, practical teaching, and quality assurance mechanism. The accreditation process helps us identify weaknesses, improve the curriculum, enhance internationalization, and improve the quality and recognition of our graduates.

Q27：如果专家问"学生是否了解 ASIIN 认证"，如何回答？
答：学生了解 ASIIN 认证的基本目的，即通过国际工程教育认证推动专业建设，提高课程质量和人才培养水平。学院通过班会、课程说明、座谈会和相关材料向学生介绍认证关注点，包括 PLO 、课程体系、实践教学、workload 、学生反馈和持续改进等内容。
English Answer: Yes, at least they understand the basic purpose. ASIIN accreditation is introduced to students as a way to improve programme quality and align with international engineering education standards. The college explains key points such as PLOs, curriculum, practical teaching, workload, student feedback, and continuous improvement through class meetings, course introductions, and student meetings.

Q28：如果专家问"认证对学生有什么影响"，如何回答？
答：认证有助于专业进一步优化课程体系、加强实践教学、改进教学质量和提升国际化水平。对学生来说，可以获得更清晰的学习目标、更合理的课程安排、更规范的考核方式和更丰富的实践机会，也有助于提升毕业生的竞争力和国际认可度。
English Answer: Accreditation helps improve the curriculum, strengthen practical teaching, improve teaching quality, and enhance internationalization. For students, this means clearer learning objectives, more reasonable course arrangements, more standardized assessment, and more practical opportunities. It can also improve graduate competitiveness and international recognition.

Q29：如何用一句话概括本专业人才培养？
答：本专业面向计算机应用领域，培养具有扎实理论基础、较强工程实践能力、良好职业素养、团队协作能力、国际视野和终身学习能力的应用型计算机工程技术人才。
English Answer: The programme trains application-oriented computer engineering professionals with a solid theoretical foundation, strong engineering practice ability, professional ethics, teamwork, international vision, and lifelong learning ability.

Q30：课程如何确保支持这些学习成果？是否有清晰对应关系？
答：有。本专业建立了三层对齐矩阵。第一，PLO-PEO 支撑矩阵说明 11 项 PLO 如何支撑 4 项长期培养目标。第二，Objective-Module Matrix 将 ASIIN SSC04 六大能力领域、11 项 PLO 和代表性课程模块进行对应。第三，课程对 PLO 支撑矩阵将每门课程映射到具体 PLO 指标点，并通过量化权重表示支撑强度。因此，课程体系不是简单堆叠，而是围绕培养目标和 PLOs 进行设计。每门课程在课程大纲中也会说明课程目标、支撑的 PLO 指标点、教学内容和考核方式，从而形成可追溯的课程支撑关系。
English Answer: Yes. We have built a three-level alignment system. First, the PLO-PEO matrix shows how the 11 PLOs support the long-term educational objectives. Second, the Objective-Module Matrix connects the ASIIN SSC04 competence areas, the 11 PLOs, and representative curriculum modules. Third, the Course-PLO Support Matrix maps each course to specific PLO indicators with quantitative weights. So the curriculum is not just a collection of courses. It is designed around the educational objectives and PLOs.

Q31：课程如何支撑毕业要求？
答：每门课程通过课程目标、教学内容、实践环节和考核方式支撑相应的 PLO 指标点。例如，《数据结构》主要支撑问题分析、设计/开发解决方案、研究能力和现代工具使用；《软件工程》支撑系统设计、工程实践、团队合作、沟通和项目管理；《计算机网络》支撑工程知识、问题分析、系统设计和现代工具使用；《工程伦理》支撑工程与可持续发展、工程伦理和社会责任。课程大纲中明确列出课程目标与 PLO 指标点之间的对应关系，课程考核也围绕这些目标设计，从而保证课程对毕业学习成果的有效支撑。
English Answer: Each course supports relevant PLO indicators through its objectives, teaching content, practical activities, and assessment methods. For example, Data Structures supports problem analysis, solution design, research ability, and tool use. Software Engineering supports system design, engineering practice, teamwork, communication, and project management. Computer Networks supports engineering knowledge, problem analysis, and tool use. Engineering Ethics supports sustainability, ethics, and social responsibility.

Q32：课程如何体现学生能力培养？
答：课程通过多种教学方法培养学生能力，包括案例教学、项目驱动、实验教学、分组讨论、综合作业、课程答辩等。理论课程主要培养基础知识和分析能力，实践课程培养工程实现和系统设计能力，项目化教学培养团队协作、沟通表达和项目管理能力。例如，在《C程序设计》中，通过小型系统开发训练编程和调试能力；在《软件工程》中，通过团队项目训练需求分析、系统设计、测试和文档写作；在《智能应用系统开发》中，通过综合项目训练新技术应用和系统集成能力。
English Answer: Courses cultivate abilities through case-based teaching, project-driven teaching, experiments, group discussions, comprehensive assignments, and course defenses. Theoretical courses mainly train knowledge and analysis ability, while practical courses train engineering implementation and system design ability. For example, C Programming trains programming and debugging through small systems. Software Engineering trains requirement analysis, system design, testing, and documentation through team projects. Intelligent Application System Development trains new technology application and system integration.

Q33：理论教学如何与工程实践紧密结合？
答：主要通过实验、课程项目、课程设计、专业实习和毕业设计实现理论与实践结合。理论课程中会引入工程案例，帮助学生理解概念和方法；实验课程让学生验证理论知识；课程设计要求学生完成较完整的系统或模块；专业实习将学生带入企业真实环境；毕业设计则要求学生综合运用所学知识解决具体问题。
English Answer: We connect theory and practice through experiments, course projects, course design, internships, and graduation design. In theoretical courses, teachers introduce engineering cases. In lab courses, students verify theory. In course projects, students develop complete systems or modules. Internships bring students into real enterprise environments, and graduation design requires students to solve practical problems.

Q34：课程之间是否有关联性或顺序要求？
答：有。课程体系按照由基础到专业、由单项技能到综合应用的逻辑设计。数学、程序设计和离散数学为数据结构、算法和专业核心课程奠定基础；数据结构、算法、数据库、操作系统、计算机网络等课程为软件工程、人工智能、数据挖掘、智能应用系统开发等课程提供支撑；课程设计、专业实习和毕业设计则综合运用前期知识。
English Answer: Yes. The curriculum follows a clear progression from foundation to professional knowledge and then to comprehensive application. Mathematics, programming, and discrete mathematics support later courses such as data structures and algorithms. Data structures, algorithms, databases, operating systems, and networks support software engineering, AI, data mining, and intelligent application development. Course projects, internships, and graduation design integrate previous knowledge.

Q35：期末考核形式由教师自由选择吗？
答：不是完全自由选择。课程考核方式必须按照课程大纲执行。专业核心课程原则上采用闭卷考试或规范化考试方式，实践性课程可以采用项目、报告、答辩等方式。课程大纲明确规定考核组成、比例和方式，教师需要按照大纲实施，不得随意改变。
English Answer: Not completely. The assessment form must follow the course syllabus. Core professional courses generally use standardized exams, such as closed-book exams, while practical courses may use projects, reports, or defenses. The syllabus clearly defines the assessment components, proportions, and methods, so teachers cannot change them freely.

Q36：核心课程在课程体系中扮演什么角色？如何与先修和后续课程衔接？
答：核心课程是能力培养的关键支撑。例如，《数据结构》连接程序设计基础与算法设计，是理解复杂数据组织和算法实现的基础；《数据库原理及应用》支撑软件开发和数据管理能力；《计算机网络》支撑网络系统和分布式应用理解；《操作系统》和《计算机组成原理》帮助学生理解计算机系统运行机制；《软件工程》则把程序设计、数据库、系统分析和项目管理综合起来。这些课程既承接前期数学、程序设计和专业基础课程，又支撑后续综合项目、专业实习和毕业设计。
English Answer: Core courses are key supports for competence development. For example, Data Structures connects programming with algorithm design. Databases supports software development and data management. Computer Networks supports understanding of network systems and distributed applications. Operating Systems and Computer Organization help students understand how computer systems work. Software Engineering integrates programming, databases, system analysis, and project management. These courses connect earlier foundational courses with later projects, internships, and graduation design.

Q37：课程体系如何培养国际化视野和跨文化交流能力？
答：主要通过外语课程、专业英语课程、国际交流项目、国际学术讲座和跨文化交流活动培养。学生学习大学英语和专业英语，训练英文技术文档阅读、专业表达和基本学术沟通能力。学校和学院也提供赴澳门、澳大利亚等地的交流项目，帮助学生了解不同教育和文化环境。
English Answer: We mainly cultivate these through English courses, Professional English, international exchange projects, academic lectures, and cross-cultural activities. Students learn to read English technical documents, express professional ideas, and conduct basic academic communication. The university and college also provide exchange opportunities, such as programmes in Macao and Australia, and encourage students to attend academic lectures and competitions.

Q38：实践环节如何与理论教学相辅相成，并评价学生动手能力？
答：实践环节围绕理论课程逐步展开。例如，程序设计课程配套上机实践，数据库课程配套数据库设计实验，计算机网络课程配套网络配置与测试，软件工程课程配套项目开发，人工智能和机器学习课程配套数据处理和模型训练实验。学生动手能力通过实验报告、项目成果、代码质量、系统演示、答辩表现和过程记录等方式评价。
English Answer: Practical components are arranged around theoretical courses. Programming courses have computer-based practice, database courses have database design labs, computer networks have network configuration and testing, software engineering has project development, and AI-related courses have data processing and model training tasks. Students' hands-on ability is evaluated through lab reports, project outcomes, code quality, system demonstrations, defense performance, and process records.

Q39：人工智能方向课程体系如何规划？
答：人工智能方向课程体系以数学、编程和算法为基础。前期课程包括高等数学、线性代数、概率论与数理统计、Python程序设计、数据结构、算法设计与分析等；在此基础上开设人工智能、机器学习、数据挖掘基础、机器人技术与应用、智能应用系统开发、AI大模型应用开发等课程。该课程体系旨在培养学生解决智能应用系统中复杂工程问题的能力，使学生掌握从数据处理、模型训练到系统开发和应用部署的基本流程。
English Answer: The AI curriculum is built on mathematics, programming, and algorithms. Students first study courses such as mathematics, linear algebra, probability and statistics, Python programming, data structures, and algorithms. Then they study AI-related courses such as Artificial Intelligence, Machine Learning, Data Mining, Robot Technology and Applications, Intelligent Application System Development, and Large AI Model Application Development.

Q40：人工智能课程是否包含经典算法、前沿技术和 AI 伦理？
答：包含。经典算法方面，课程会讲解决策树、支持向量机、聚类、贝叶斯方法、梯度下降、反向传播等内容。前沿技术方面，会结合大模型微调、提示词工程、RAG、开源大模型应用开发等内容进行介绍或实践。伦理方面，除了《工程伦理》课程外，人工智能相关课程也会融入算法偏见、数据隐私、可解释性、安全与责任等内容。
English Answer: Yes. Classical algorithms include decision trees, SVM, clustering, Bayesian methods, gradient descent, and backpropagation. Frontier topics include large model fine-tuning, prompt engineering, RAG, and open-source large model application development. AI ethics is also included. Besides Engineering Ethics, AI-related courses discuss algorithm bias, data privacy, explainability, safety, and responsibility.

Q41：课程案例和项目来源是什么？如何保证实用性和前沿性？
答：课程案例和项目主要来源于教师科研课题、企业合作项目、行业应用场景和开源技术实践。教师会根据课程难度对真实问题进行教学化改造，使学生能够在可控范围内完成项目。同时，课程也会引入大模型、数据分析、智能医疗、智能制造等前沿应用场景，使学生了解新技术发展趋势。
English Answer: Course cases and projects mainly come from faculty research, enterprise cooperation, industry application scenarios, and open-source technology practice. Teachers adapt real problems into teaching projects with appropriate difficulty. At the same time, courses introduce frontier application scenarios such as large models, data analysis, intelligent healthcare, and intelligent manufacturing, so students can understand new technology trends.

Q42：毕业设计和毕业论文有什么区别？是否必须二选一？
答：毕业设计和毕业论文在侧重点上有所不同。毕业设计更强调工程实现和应用价值，要求学生综合运用所学知识完成系统设计、开发、测试和说明书撰写；毕业论文更强调研究分析和学术表达，要求学生围绕某一问题进行研究、分析和总结。对于计算机科学与技术专业，学生根据导师拟定或审核的题目完成毕业设计或毕业论文。
English Answer: Graduation design emphasizes engineering implementation and practical value. Students are expected to design, develop, test, and document a system. Graduation thesis emphasizes research analysis and academic writing. For Computer Science and Technology students, the topic proposed or approved by the supervisor determines whether it is more like a design or a thesis.

Q43：毕业设计如何评分？是否只做系统，不写文字材料？
答：毕业设计不仅要有成果，也需要撰写设计说明书或论文。评分通常由指导教师评分、评阅教师评分和答辩小组评分共同构成。评价内容包括选题与开题、文献调研、外文资料翻译、设计或研究质量、系统实现、论文或说明书撰写质量、工作态度、创新性和答辩表现等。
English Answer: No. Graduation design requires both a practical outcome and written documentation. The grade usually consists of the supervisor's evaluation, reviewer's evaluation, and defense committee's evaluation. The assessment covers topic selection, proposal, literature review, foreign literature translation, design or research quality, system implementation, writing quality, working attitude, innovation, and defense performance.

Q44：课程内项目化教学如何匹配培养目标和 ASIIN 能力要求？
答：项目化教学围绕本专业应用型人才培养目标和 ASIIN 能力要求进行设计。课程首先将 PLO 指标分解为具体课程目标，再设计与行业实践相近的项目任务，将知识点融入需求分析、方案设计、编码实现、测试验证和报告答辩全过程。
English Answer: Project-based teaching is designed around our application-oriented objectives and ASIIN competence requirements. We first break down the PLOs into course objectives, and then design project tasks close to industry practice. Knowledge points are integrated into requirement analysis, solution design, coding, testing, reporting, and defense.

Q45：不同课程的项目化教学是否具有递进性？如何避免重复或脱节？
答：有递进性。专业按照"基础认知—单项技能—综合应用—系统设计"的逻辑设计课程项目。低年级C程序设计项目侧重基础语法和程序逻辑；中年级数据库、数据结构、算法和软件工程项目侧重综合应用；高年级智能应用系统开发、Web应用开发、毕业设计等项目要求学生整合多门课程知识，完成更复杂的系统设计。
English Answer: Yes, it is progressive. We follow a path from basic cognition to single-skill training, then comprehensive application, and finally system design. Lower-year C programming projects focus on syntax and basic logic. Middle-year database, data structure, algorithm, and software engineering projects focus on comprehensive application. Senior-year projects require students to integrate knowledge from multiple courses.

Q46：项目选题来源是什么？是否结合企业真实项目或科研课题？
答：项目选题主要来自三类渠道：第一，企业真实项目的教学化改造，例如管理系统、数据分析系统、Web应用等；第二，教师科研项目的拆解，例如人工智能、数据挖掘、智能检测、网络安全等方向；第三，课程知识点对应的典型工程案例。
English Answer: Project topics mainly come from three sources. First, real enterprise projects adapted for teaching, such as management systems, data analysis systems, or web applications. Second, faculty research topics, such as AI, data mining, intelligent detection, or cybersecurity. Third, typical engineering cases related to course knowledge.

Q47：项目化教学如何评价学生个人贡献？
答：项目化教学通常采用过程评价和结果评价相结合的方式。过程评价包括任务分工、开发日志、阶段性检查、课堂汇报和小组讨论；结果评价包括系统功能、代码质量、测试结果、文档质量和答辩表现。为了避免"搭便车"，教师会要求明确个人任务，并结合组内互评、个人答辩和提交记录判断个人贡献。
English Answer: We combine process evaluation and final outcome evaluation. Process evaluation includes task division, development logs, stage checks, class presentations, and group discussions. Final evaluation includes system functions, code quality, test results, documentation quality, and defense performance. To avoid "free riding", students must clarify individual tasks, and we also use peer evaluation, individual defense, and submission records.

Q48：教师科研活动如何支持课程发展？
答：教师科研活动可以直接支持课程内容更新、项目案例设计和毕业设计选题。例如，教师在人工智能、大数据、网络安全、智能应用等方向的科研成果，可以转化为课程案例、实验项目、课程设计题目或毕业设计题目。科研也能帮助教师掌握前沿技术，从而提高课程的先进性和实践性。
English Answer: Faculty research directly supports course updates, project cases, and graduation design topics. For example, research in AI, big data, cybersecurity, and intelligent applications can be transformed into course cases, experiments, course projects, or graduation design topics. Research also helps teachers keep up with frontier technologies.

Q49：教师教学竞赛和学生学科竞赛之间是否有联动？
答：有。教师教学竞赛中的教学设计、课程思政案例和项目化教学方案可以转化为学生竞赛指导资源；学生学科竞赛中发现的技术难点和工程问题，也可以反向促进教师改进教学内容和方法。学校通过工作量认定、绩效考核、荣誉奖励和职称晋升等机制鼓励教师指导学生竞赛。
English Answer: Yes. Teaching designs, ideological and political education cases, and project-based teaching methods from teachers' competitions can become useful resources for student competition training. At the same time, technical problems found in student competitions can help teachers improve course content and practice training.

Q50：企业如何安排学生实习？实习目标与培养目标如何衔接？
答：企业实习通常采用项目驱动和双导师指导模式。学生在企业导师和校内导师共同指导下，参与系统开发、测试、数据处理、运维支持、技术文档等工作。实习目标与培养目标高度一致，都是为了将课堂知识转化为工程实践能力，培养学生适应岗位、解决问题和团队协作的能力。
English Answer: Enterprise internships usually use a project-driven model with dual supervision. Students are guided by both enterprise mentors and university supervisors. They may participate in system development, testing, data processing, operation and maintenance, and technical documentation. The internship objectives are closely aligned with programme objectives.

Q51：企业是否参与毕业设计或毕业论文？
答：可以参与。部分毕业设计题目来源于企业实际需求，企业工程师可以参与题目建议、过程指导或实践评价。学生在企业实习期间形成的项目也可以在符合学校要求的情况下转化为毕业设计题目。这样能够增强毕业设计的实践性和应用价值。
English Answer: Yes, they can. Some graduation design topics come from real enterprise needs. Enterprise engineers may participate in topic suggestions, process guidance, or practical evaluation. Projects developed during internships can also become graduation design topics if they meet university requirements.

Q52：毕业设计是否允许在校外完成？
答：允许符合条件的学生在校外单位结合实习或企业项目完成毕业设计，但需要提交申请并经学院审核批准。学生仍需接受校内导师管理，并按学校要求完成开题、中期检查、论文或设计说明书、查重、评阅和答辩。
English Answer: Yes, qualified students may complete graduation design in an external organization, especially when it is connected with an internship or enterprise project. But they must apply and get approval from the college. They still need to be supervised by university teachers and complete all required steps.

Q53：学生实习是否与毕业设计结合？
答：可以结合。部分学生可以将实习中接触到的实际项目，在符合学校要求和导师审核的情况下，转化为毕业设计选题。这样既能提高毕业设计的实践价值，也能使学生更深入地解决真实工程问题。
English Answer: Yes. Some students can transform real projects from their internships into graduation design topics, as long as the topic is approved by the supervisor and meets university requirements. This improves the practical value of the graduation design and helps students solve real engineering problems more deeply.

Q54：如何处理课程项目与企业项目难度不匹配的问题？
答：教师会对企业真实项目进行教学化改造，保留核心工程逻辑和能力训练目标，同时适当降低复杂度，使其适合本科教学。项目通常会明确功能范围、技术要求和评价标准，确保学生能够在课程周期内完成，并达到课程目标。
English Answer: Teachers adapt real enterprise projects for teaching. We keep the core engineering logic and competence objectives, but reduce the complexity to make the project suitable for undergraduate students. We also define the function scope, technical requirements, and assessment criteria clearly, so students can complete the project within the course period.

Q55：如何说明本专业课程体系支持学生按期毕业？
答：课程体系按照8个学期合理安排，总体 workload 较均衡，基础课程、专业课程和实践环节逐步推进。学校通过学业预警、补考重修、学生支持和课程反馈机制帮助学生完成学业。自评报告中也显示学生整体毕业情况稳定，退学率较低。
English Answer: The curriculum is arranged over eight semesters, with a generally balanced workload. Foundational courses, professional courses, and practical components are arranged progressively. The university also provides academic warning, make-up exams, retakes, student support, and course feedback mechanisms to help students complete their study on time.

Q56：如何评价课程体系合理性？
答：课程体系合理性通过专家评审、学生问卷、教师反馈、毕业生反馈、用人单位反馈和课程目标达成度进行评价。评价内容包括课程结构、课程顺序、实践比例、课程对 PLO 支撑、行业适应性和学生满意度。评价结果用于后续培养方案和课程体系修订。
English Answer: We evaluate curriculum rationality through expert review, student surveys, teacher feedback, graduate feedback, employer feedback, and course outcome achievement analysis. We consider curriculum structure, course sequence, practice proportion, support for PLOs, industry relevance, and student satisfaction. The results are used for future revisions.

Q57：课程体系是否会定期修订？
答：会。培养方案保持总体稳定，但会根据学校要求、专业发展、行业需求、学生反馈、毕业生反馈和用人单位反馈定期修订。一般会进行阶段性大修，同时根据实际问题进行年度小调整。修订过程包括调研、论证、审核和发布。
English Answer: Yes. The cultivation plan remains generally stable, but it is revised periodically according to university requirements, professional development, industry needs, student feedback, graduate feedback, and employer feedback. Usually, there are major revisions at certain intervals and smaller annual adjustments when needed.

Q58：本专业是否重视网络安全、数据安全和隐私保护？
答：重视。课程体系中包含网络安全等相关课程或内容，同时在工程伦理、人工智能、数据库、软件工程、网络等课程中也会涉及数据安全、隐私保护、合规性和职业责任等内容。实践项目和毕业设计也要求学生遵守数据和系统安全规范。
English Answer: Yes. The curriculum includes cybersecurity-related courses or content. Data security, privacy protection, compliance, and professional responsibility are also covered in courses such as engineering ethics, AI, databases, software engineering, and computer networks. Practical projects and graduation design also require students to follow data and system security standards.

Q59：如何处理人工智能技术快速发展带来的课程更新问题？
答：专业通过课程内容更新、选修课程建设、教师培训、科研反哺教学、企业讲座和实践项目引入人工智能新技术。例如，在机器学习、人工智能、数据挖掘、智能应用系统开发和AI大模型应用开发等课程中，引入大模型、RAG、提示词工程等相关内容，使课程能够跟上技术发展。
English Answer: We update course content, develop electives, support faculty training, use research to enrich teaching, invite enterprise experts, and introduce AI-related projects. For example, courses such as Machine Learning, Artificial Intelligence, Data Mining, Intelligent Application System Development, and Large AI Model Application Development include topics such as large models, RAG, and prompt engineering.

Q60：课程如何培养学生文献检索和资料查询能力？
答：通过课程作业、综合报告、科技论文写作、毕业设计和科研训练培养。学生需要使用图书馆数据库、学术搜索平台和网络资源查找资料，阅读技术文档和学术文献，并在报告或论文中规范引用。教师也会在课程中指导文献检索和资料分析方法。
English Answer: We train this through assignments, comprehensive reports, scientific writing, graduation design, and research training. Students use library databases, academic search platforms, and online resources to search for materials, read technical documents and papers, and cite them properly.

Q61：课程 PLO 权重矩阵有什么作用？
答：课程 PLO 权重矩阵可以量化不同课程对不同 PLO 指标点的支撑程度。它不仅说明"哪门课程支撑哪项能力"，还进一步说明"支撑强度是多少"。这样有利于课程目标达成评价、PLO 达成评价和持续改进，也能避免课程支撑关系过于笼统。
English Answer: The matrix quantifies how strongly each course supports each PLO indicator. It not only shows which course supports which ability, but also shows the level of support. This is useful for course objective achievement evaluation, PLO achievement evaluation, and continuous improvement.

Q62：课程 PLO 权重如何确定？
答：先根据课程目标和教学内容判断课程对 PLO 指标点的支撑强度，通常分为高、中、低支撑；然后将高、中、低转换为数值，并在每个 PLO 指标点内进行归一化，使该指标点下所有课程权重之和为1。这样既保留了课程支撑强度差异，也保证评价结果具有可比性。
English Answer: We first judge the support level according to course objectives and content, usually as high, medium, or low. Then we convert these levels into numerical values and normalize them within each PLO indicator, so the total weight for each indicator equals one.

Q63：如何保证通识课程也支撑 PLO？
答：通识课程主要支撑工程伦理、社会责任、沟通、团队合作、身心健康和终身学习等PLO。例如思想政治类课程支撑价值观和社会责任，大学英语和专业英语支撑沟通和跨文化交流，大学体育和心理健康教育支撑身心健康，职业规划和就业指导支撑职业发展和终身学习。
English Answer: General education courses mainly support ethics, social responsibility, communication, teamwork, physical and mental health, and lifelong learning. For example, ideological and political courses support values and social responsibility. English and Professional English support communication and cross-cultural exchange.

Q64：实践课程如何由浅入深？
答：实践课程从基础到综合逐步展开。低年级通过C程序设计课程设计训练基础编程能力；中年级通过算法课程设计、软件工程课程设计训练问题分析和系统开发能力；高年级通过智能应用系统开发课程设计、专业实习和毕业设计训练综合工程能力。第二课堂贯穿整个培养过程，补充创新和综合素质培养。
English Answer: Practical courses move from basic training to comprehensive practice. Lower-year students develop basic programming ability through the C Programming Project. Middle-year students develop problem analysis and system development ability through algorithm and software engineering projects. Senior-year students develop comprehensive engineering ability through intelligent application projects, internship, and graduation design.

Q65：专业见习、专业实习和毕业设计三者有何区别？
答：专业见习偏认知性，帮助学生了解行业、企业和岗位；专业实习偏岗位实践，学生进入企业参与真实工作任务；毕业设计偏综合能力检验，要求学生在导师指导下完成一个系统、设计或研究成果。三者由浅入深，共同支撑工程实践能力培养。
English Answer: Professional practice is more cognitive. It helps students understand the industry, enterprises, and job positions. Professional internship is workplace-based practice, where students participate in real tasks in enterprises. Graduation design is a comprehensive evaluation, where students complete a system, design, or research outcome under supervision.

Q66：实践教学如何支撑 PLO3 设计/开发解决方案？
答：实践教学要求学生根据需求进行方案设计、系统实现、测试和优化，直接支撑 PLO3。例如课程设计训练学生从需求到实现的完整过程，专业实习训练学生在真实环境中解决问题，毕业设计要求学生完成较完整的设计或研究成果。
English Answer: Practical teaching requires students to analyze requirements, design solutions, implement systems, test results, and make improvements. Course projects train the full process from requirement to implementation. Internships train problem-solving in real environments. Graduation design requires students to complete a relatively complete design or research outcome.

Q67：实践教学如何支撑 PLO8 个人与团队？
答：许多实践项目采用小组合作，学生需要承担不同角色，进行任务分工、沟通协调和共同决策。教师通过组内互评、过程记录和答辩评价个人贡献，从而培养学生在团队中承担个体、成员和负责人角色的能力。
English Answer: Many practical projects are team-based. Students take different roles, divide tasks, communicate, coordinate, and make decisions together. Teachers evaluate individual contributions through peer review, process records, and defense.

Q68：实践教学如何支撑 PLO9 沟通？
答：实践教学中要求学生撰写项目报告、实验报告、实习报告和毕业设计说明书，并进行项目展示和答辩。这些环节训练学生系统表达技术方案、回应问题、与团队成员和教师沟通的能力，直接支撑沟通能力。
English Answer: Practical teaching requires students to write project reports, lab reports, internship reports, and graduation design documents. They also need to present projects and answer questions in defenses. These activities train students to explain technical solutions clearly and communicate with teachers and teammates.

Q69：实践教学如何支撑 PLO10 项目管理？
答：在软件工程课程设计、智能应用系统开发课程设计、专业实习和毕业设计中，学生需要制定计划、分配任务、管理进度、控制质量和完成文档。这些过程帮助学生理解工程管理和项目管理方法，支撑 PLO10。
English Answer: In software engineering projects, intelligent application system projects, internships, and graduation design, students need to plan tasks, divide work, manage progress, control quality, and complete documents. These activities help students understand basic engineering management and project management methods.

Q70：如果专家问"课程体系中最重要的改进是什么"，如何回答？
答：可以回答：近年来课程体系更加重视工程实践、项目化教学和新技术融入。一方面，专业强化了课程设计、专业实习、毕业设计等实践环节；另一方面，在人工智能、机器学习、数据挖掘、云计算、大数据开发、AI大模型应用开发等方向增加或更新课程内容。同时，专业通过课程评价和学生反馈持续优化课程顺序和学习负担。
English Answer: I would say that in recent years, we have placed more emphasis on engineering practice, project-based teaching, and emerging technologies. We have strengthened course projects, internships, and graduation design. We have also updated content in AI, machine learning, data mining, cloud computing, big data development, and large AI model applications.

Q71：如何用一句话概括本专业课程体系？
答：本专业课程体系按照"数学与基础科学—工程基础—专业核心—工程应用—集中实践"的逻辑逐步递进，系统支撑11项 PLO 的达成。
English Answer: The curriculum progresses from mathematics and basic sciences to engineering fundamentals, professional core courses, engineering applications, and focused practical teaching, systematically supporting the achievement of the 11 PLOs.

Q72：如何用一句话概括本专业实践教学？
答：本专业实践教学由课程实验、课程设计、专业见习、专业实习、毕业设计和第二课堂构成，形成从基础训练到综合工程实践的递进式培养体系。
English Answer: Practical teaching consists of course experiments, course projects, professional practice, professional internship, graduation design, and extracurricular activities, forming a progressive system from basic training to comprehensive engineering practice.

Q73：教师是否有企业或工程实践经验？企业实践如何促进教学？
答：有。学校鼓励教师参加企业实践、工程项目、产学研合作和专业培训。教师通过到企业实践，可以了解行业最新技术、开发流程和岗位能力要求，再将这些经验转化为教学案例、课程项目或毕业设计题目。这样能够增强教学内容的实践性和前沿性。
English Answer: Yes. The university encourages teachers to participate in enterprise practice, engineering projects, university-enterprise cooperation, and professional training. Through enterprise practice, teachers understand the latest technologies, development processes, and job requirements. Then they can turn these experiences into teaching cases, course projects, or graduation design topics.

Q74：教师参加企业交流后，是否会把经验分享给课程团队？
答：会。教师参加企业实践或交流后，一般会通过课程组研讨、集体备课、教学沙龙或专业建设会议分享实践经验和技术成果。相关内容可以进一步融入课程案例、实验项目、课程设计和毕业设计中。这样不仅提升单个教师的实践能力，也促进整个课程团队教学内容更新。
English Answer: Yes. Teachers usually share their practical experience and achievements through course group meetings, collective lesson preparation, teaching salons, or programme development meetings. These experiences can then be integrated into course cases, lab projects, course design, and graduation design.

Q75：教师如何进行自我提升？学校是否有政策支持？
答：教师可以通过国内外访学、学术交流、教学培训、企业实践、教学竞赛、科研项目、专业会议、在职攻读博士学位等方式进行自我提升。学校设有教师教学发展中心，组织新教师培训、教学沙龙、教学研究和教师发展活动。同时，学校实施青蓝工程，支持青年教师成长；鼓励教师参与企业实践，提升双师型能力。
English Answer: Teachers improve themselves through domestic and overseas visiting study, academic exchange, teaching training, enterprise practice, teaching competitions, research projects, professional conferences, and in-service doctoral study. The university has a Center for Teaching and Learning Development, organizes new teacher training and teaching salons, implements the Qinglan Project, and supports enterprise practice.

Q76：青蓝工程对青年教师发展有什么作用？
答：青蓝工程主要通过导师指导、教学培训、教学竞赛、科研支持和团队建设等方式培养青年教师。新教师可以在经验丰富教师指导下熟悉课程教学、课堂管理、科研申报和学生指导工作。该项目有助于青年教师尽快提升教学能力和科研能力，保障教师队伍的可持续发展。
English Answer: The Qinglan Project supports young teachers through mentorship, teaching training, teaching competitions, research support, and team development. New teachers can learn course teaching, classroom management, research application, and student guidance from experienced teachers. It helps young teachers improve their teaching and research abilities more quickly.

Q77：什么是双师型教师？本专业如何建设双师型教师队伍？
答：双师型教师是指既具有较强教学科研能力，又具有工程实践或行业经验的教师。本专业通过鼓励教师到企业开展专业实践、参与企业项目、指导学生实习和校企合作项目等方式提升教师工程实践能力。学校相关规定也要求申报高级职称的教师具备一定企业或行业实践经历。
English Answer: Dual-qualified teachers are teachers who have both academic teaching ability and engineering or industry experience. The programme encourages teachers to participate in enterprise practice, enterprise projects, student internships, and university-enterprise cooperation. The university also requires teachers applying for senior academic titles to have relevant enterprise or professional practice experience.

Q78：教师是否参加国际合作或海外交流？
答：学校和学院鼓励教师参加国际学术会议、海外访学、国际合作研究和交流访问。教师通过国际交流可以了解学科前沿、拓宽国际视野，并将相关内容反馈到课程教学和科研训练中。国际合作也有助于提升专业建设水平和学生国际化培养质量。
English Answer: Yes. The university and college encourage teachers to attend international conferences, visit overseas universities, conduct international research cooperation, and participate in exchange visits. These experiences help teachers understand academic frontiers, broaden their international vision, and bring international perspectives into teaching and research training.

Q79：如何保证外聘教师或企业导师质量？
答：外聘教师或企业导师一般需要具备相关行业经验、工程项目经验或教学指导能力。学院会对其学历、职称、岗位经历、项目经历和指导能力进行审核。聘用后，通过学生反馈、课程评价、督导听课、项目成果质量等方式进行评价，确保其能够有效参与人才培养。
English Answer: External teachers or enterprise mentors should have relevant industry experience, engineering project experience, or teaching guidance ability. The college reviews their educational background, professional title, job experience, project experience, and guidance ability. After appointment, we evaluate them through student feedback, course evaluation, teaching supervision, and the quality of project outcomes.

Q80：国际化对教师发展有什么作用？
答：教师通过参加国际会议、海外访问、国际合作研究和国际课程交流，可以了解国际学科前沿和教育教学方法。这些经历有助于教师更新课程内容、提升学术水平和教学能力，也能为学生提供更开阔的国际视野和跨文化交流机会。
English Answer: Through international conferences, overseas visits, international research cooperation, and international course exchange, teachers can learn about academic frontiers and new teaching methods. These experiences help teachers update course content, improve academic level and teaching ability, and provide students with a broader international perspective.

Q81：教师进修对教学有什么促进作用？
答：教师进修能够帮助教师更新知识结构、掌握新技术、学习先进教学方法，并将进修成果转化为课程内容、教学案例和实践项目。例如，教师通过学习人工智能、大数据、网络安全等方向的新技术，可以在相关课程中加入新案例和新实验，提升课程前沿性。
English Answer: Teacher training helps teachers update their knowledge structure, learn new technologies, and adopt better teaching methods. The results can be transformed into course content, teaching cases, and practical projects. For example, after training in AI, big data, or cybersecurity, teachers can add new cases and experiments to related courses.

Q82：学校如何支持教师参加培训和进修？
答：学校通过教师教学发展中心、青蓝工程、国内外访学、企业实践、教学培训、教学竞赛、学术会议、在职攻读博士等方式支持教师发展。教师可以根据专业建设和个人发展需要参加相关培训，学校在政策、经费和平台方面提供支持。
English Answer: The university supports teachers through the Center for Teaching and Learning Development, the Qinglan Project, domestic and overseas visits, enterprise practice, teaching training, teaching competitions, academic conferences, and in-service doctoral study. Teachers can participate in training according to programme needs and personal development, with support in policy, funding, and platforms.

Q83：如何说明本专业教师队伍能够满足教学需要？
答：本专业教师队伍具有较好的学历、职称和学科背景结构，涵盖计算机科学与技术、软件工程、信息与通信工程等相关方向。除本专业教师外，数学、物理、英语和通识课程由相关学院教师承担。教师数量、专业背景和教学能力总体能够满足课程教学、实验实践、毕业设计和学生指导需要。
English Answer: The teaching team has a good structure in terms of academic qualifications, professional titles, and disciplinary backgrounds. Teachers cover computer science and technology, software engineering, information and communication engineering, and related fields. Overall, the number, background, and teaching ability of teachers can meet the needs of course teaching, experiments, graduation design, and student guidance.

Q84：教师是否了解课程支撑哪些 PLO？
答：教师在制定课程大纲时必须明确课程目标与 PLO 指标点之间的对应关系，并设计相应教学内容和考核方式。因此，教师应清楚自己课程支撑哪些 PLO，以及如何通过教学和评价实现这些目标。
English Answer: Yes. When teachers develop course syllabi, they must clearly define the relationship between course objectives and PLO indicators, and then design teaching content and assessment methods accordingly. So teachers should know which PLOs their courses support and how to realize them through teaching and assessment.

Q85：如何确保教学大纲的质量和一致性？如何管理修订与更新？
答：学院采用统一的工程认证版课程大纲模板，要求每门课程明确课程目标、支撑的 PLO 指标点、教学内容、教学方法、课程思政或工程伦理元素、考核方式、评分标准和持续改进措施。修订流程一般包括：任课教师根据培养方案和课程目标制定或修订大纲；课程组或系部组织审核；学院教学管理部门备案；学校或学院在期初、期中、期末教学检查中核验执行情况。
English Answer: The college uses a unified syllabus template for engineering accreditation. Each syllabus must include course objectives, supported PLO indicators, teaching content, teaching methods, ideological or ethical elements, assessment methods, grading criteria, and continuous improvement measures. The revision process includes teacher drafting, course group review, college-level filing, and teaching checks.

Q86：学生是否能看到教学大纲？是否知道每次课的学习目标和内容？
答：学生可以通过教学管理系统、课程平台或任课教师发布的资料查看课程大纲。课程大纲中明确课程目标、教学内容、教学进度、考核方式和课程对 PLO 的支撑关系。任课教师通常会在课程开始时介绍整体安排，并在每次课或每个教学单元中说明本次学习重点和要求。
English Answer: Yes. Students can access syllabi through the teaching management system, course platforms, or materials provided by teachers. The syllabus clearly shows course objectives, teaching content, teaching schedule, assessment methods, and PLO support. Teachers usually introduce the overall course arrangement at the beginning and explain key learning points for each teaching unit.

Q87：课程案例和项目来源是什么？如何保证实用性和前沿性？
答：课程案例和项目主要来源于教师科研课题、企业合作项目、行业应用场景和开源技术实践。教师会根据课程难度对真实问题进行教学化改造，使学生能够在可控范围内完成项目。同时，课程也会引入大模型、数据分析、智能医疗、智能制造等前沿应用场景，使学生了解新技术发展趋势。
English Answer: They mainly come from faculty research, enterprise cooperation, industry application scenarios, and open-source technology practice. Teachers adapt real problems into projects suitable for undergraduate teaching. At the same time, they introduce frontier topics such as large models, data analysis, intelligent healthcare, and intelligent manufacturing.

Q88：教师科研活动如何支持课程发展？
答：教师科研活动可以直接支持课程内容更新、项目案例设计和毕业设计选题。例如，教师在人工智能、大数据、网络安全、智能应用等方向的科研成果，可以转化为课程案例、实验项目、课程设计题目或毕业设计题目。科研也能帮助教师掌握前沿技术，从而提高课程的先进性和实践性。
English Answer: Faculty research supports course updates, project case design, and graduation design topics. For example, research in AI, big data, cybersecurity, and intelligent applications can be transformed into teaching cases, experiments, course projects, or graduation design topics.

Q89：课程相关人员对教学、指导和管理资源是否满意？
答：总体满意度较高。教师认为现有教学资源、实验室条件、课程平台和管理支持基本能够满足课程教学需要。学生对教师指导、实验室开放、课程资源和在线平台也总体满意。对于少量资源不足或前沿技术平台需要进一步加强的问题，学院会通过实验室建设、软件平台更新、企业合作和经费投入逐步改善。
English Answer: Overall, satisfaction is relatively high. Teachers generally believe that teaching resources, laboratory conditions, course platforms, and administrative support can meet teaching needs. Students are also generally satisfied with teacher guidance, lab access, course resources, and online platforms.

Q90：如果出现资源瓶颈，专业负责人如何应对？
答：专业负责人会通过多种方式解决资源瓶颈。对于实验设备或软件平台不足的问题，可以申请学校专项经费、更新实验室平台或与企业共建实训资源；对于师资不足的问题，可以通过引进人才、教师培训、校内教师协同、外聘企业专家等方式解决；对于课程资源不足的问题，可以建设在线课程资源、共享课程案例和完善课程平台。
English Answer: The programme leader uses several approaches. For insufficient equipment or software, the programme may apply for special funding, update laboratory platforms, or co-build training resources with enterprises. For staff shortages, the college may recruit new teachers, train current teachers, coordinate internal teaching resources, or invite enterprise experts.

Q91：课程资源和在线平台如何支持教学？
答：学校使用教学管理系统和在线教学平台支持课程教学。教师可以发布课件、视频、作业、通知和学习资料，学生可以在线提交作业、查看反馈、参与讨论和进行自主学习。在线平台也有助于混合式教学和课后学习支持。
English Answer: The university uses teaching management systems and online platforms to support teaching. Teachers can upload slides, videos, assignments, notices, and learning materials. Students can submit assignments, receive feedback, join discussions, and study independently.

Q92：实验室和实践平台是否满足教学需要？
答：总体能够满足教学需要。学院建设了多类计算机相关实验室和实践平台，配备计算机、开发环境、仿真软件和专业教学软件，支持程序设计、数据库、网络、软件工程、人工智能、大数据等课程实验和项目开发。学院也会根据课程发展和技术更新持续改善实验条件。
English Answer: Overall, yes. The college has built several computer-related laboratories and practical platforms. They are equipped with computers, development environments, simulation software, and professional teaching software. They support experiments and projects in programming, databases, networks, software engineering, AI, and big data.

Q93：图书馆和信息资源如何支持学生学习？
答：学校图书馆和数字资源为学生提供专业图书、电子书、期刊数据库和学术搜索平台。学生可以通过图书馆、数据库和在线资源查找课程学习、课程项目、毕业设计和科研训练所需资料。专业英语、科技论文写作和毕业设计等课程也会训练学生文献检索和学术表达能力。
English Answer: The library and digital resources provide professional books, e-books, journal databases, and academic search platforms. Students can use them for course learning, projects, graduation design, and research training. Courses such as Professional English, Scientific and Technical Writing, and graduation design also train students in literature search and academic writing.

Q94：学生是否能接触真实工程问题？
答：可以。学生通过课程项目、企业案例、专业见习、专业实习、毕业设计、教师科研项目和竞赛项目接触真实或接近真实的工程问题。例如，软件系统开发、数据处理、网络配置、智能应用系统开发和企业管理系统设计等，都具有较强工程实践特点。
English Answer: Yes. Students can work on real or near-real engineering problems through course projects, enterprise cases, professional practice, internships, graduation design, faculty research projects, and competitions.

Q95：学生是否有机会使用现代工具？
答：有。学生在课程和项目中会使用编程开发环境、数据库管理工具、网络配置工具、建模工具、测试工具、机器学习框架和数据分析工具等。例如 Python、Java、Visual Studio、PyCharm、数据库系统、网络实验平台、PyTorch、TensorFlow 等。使用现代工具是 PLO5 的重要内容。
English Answer: Yes. In courses and projects, students use programming environments, database tools, network configuration tools, modeling tools, testing tools, machine learning frameworks, and data analysis tools. Examples include Python, Java, Visual Studio, PyCharm, database systems, network lab platforms, PyTorch, and TensorFlow.

Q96：如何保证学生有足够时间准备考试？
答：课程考核通常安排在学期末，学校会统一组织考试时间，避免考试过度集中。课程大纲和教学安排会提前说明考核方式和要求，教师也会在考试前进行复习指导或答疑。对于课程项目和综合作业，教师一般会提前布置任务，给学生较充分时间完成。
English Answer: Course assessments are usually arranged at the end of the semester, and the university coordinates exam schedules to avoid too much concentration. The syllabus and teaching schedule explain assessment methods in advance. Teachers also provide review guidance and Q&A before exams.

Q97：教师如何支持学生独立科研或创新工作？
答：教师通过课程项目、科研训练、大学生创新创业训练项目、学科竞赛、毕业设计和第二课堂支持学生开展独立探索。学生可以在教师指导下查阅文献、提出问题、设计方案、开展实验或系统开发，并通过论文、项目报告、竞赛作品或毕业设计展示成果。
English Answer: Teachers support students through course projects, research training, innovation and entrepreneurship projects, competitions, graduation design, and extracurricular activities. Under teacher guidance, students learn to search literature, identify problems, design solutions, conduct experiments, develop systems, and present results.

Q98：教师如何帮助有升学意向的学生？
答：教师会为有升学意向的学生提供课程学习建议、方向选择建议、科研训练机会、文献阅读指导和复试准备建议。班主任、辅导员和专业教师也会帮助学生规划考研时间、选择目标院校和准备专业课程复习。
English Answer: Teachers provide advice on course learning, research directions, literature reading, research training, and postgraduate interview preparation. Head teachers, counselors, and professional teachers also help students plan their postgraduate entrance exam schedule, choose target universities, and prepare professional courses.

Q99：学生如何了解课程成绩和考试安排？
答：学生可以通过教学管理系统查看课程安排、考试安排和课程成绩。教师也会通过课程平台或班级群发布作业、考试和项目要求。考试结束后，教师按规定录入成绩，学生可在线查询。如果对成绩有疑问，可以申请复核。
English Answer: Students can check course schedules, exam arrangements, and grades through the teaching management system. Teachers also publish assignments, exam information, and project requirements through course platforms or class groups. After exams, teachers enter grades into the system. If students have questions about their grades, they can apply for review.

Q100：专业如何支持学生就业？
答：学校和学院通过就业指导、职业规划、企业宣讲、招聘信息发布、实习基地、校企合作、就业咨询和校友资源等方式支持学生就业。课程体系也通过软件开发、系统设计、数据处理、人工智能应用和项目管理等能力培养，提高学生岗位适应能力。
English Answer: The university and college support employment through career guidance, career planning courses, enterprise presentations, recruitment information, internship bases, university-enterprise cooperation, employment counseling, and alumni resources.

Q101：专业如何支持学生继续深造？
答：专业课程提供数学、算法、系统、人工智能等基础，为继续深造打下学术基础。教师也会通过科研训练、毕业设计、文献阅读、学科竞赛和考研指导帮助有深造意向的学生提升研究能力和专业能力。
English Answer: The programme provides strong foundations in mathematics, algorithms, computer systems, and AI, which support further study. Teachers also help students through research training, graduation design, literature reading, competitions, and postgraduate study guidance.

Q102：本专业如何体现学生中心？
答：我认为本专业的"学生中心"主要体现在课程设计、教学实施、学习支持、学生反馈和持续改进几个方面。首先，在课程设计上，教师围绕学生毕业时应达到的11项 PLO 来设计课程体系。其次，在教学实施上，采用项目化、案例化、实践化教学，突出学生主动参与。第三，学习支持上，有辅导员、班主任、任课教师提供全方位帮扶。第四，学生反馈可通过评教、座谈会、信息员等渠道收集，并用于教学改进。
English Answer: It is reflected in curriculum design, teaching implementation, learning support, student feedback, and continuous improvement. Courses are designed around the 11 PLOs. We use project-based, case-based, and practice-oriented teaching. The college provides support through counselors, head teachers, and course teachers.

Q103：学生流动性如何保障？
答：学校制定了学生转专业管理办法，符合条件的学生可以申请转专业，已修读的相近课程可申请学分认定。对于国际交流学生，学校也有相关管理办法，支持学生参与交流学习和学分认定。
English Answer: The university has regulations for programme transfer. Qualified students can apply to transfer to another programme, and similar completed courses can be recognized for credits. For international exchange students, the university also has management rules to support exchange study and credit recognition.

Q104：学生如何接触前沿技术？
答：学生通过专业选修课程、教师科研项目、企业讲座、学科竞赛、技术沙龙、毕业设计和第二课堂接触前沿技术。例如人工智能、大数据、云计算、网络安全、AI大模型、智能医疗系统等方向都有相关课程或实践机会。
English Answer: Students access frontier technologies through professional electives, faculty research projects, enterprise lectures, competitions, technical salons, graduation design, and extracurricular activities. Areas such as AI, big data, cloud computing, cybersecurity, large AI models, and intelligent healthcare are covered through courses or practical activities.

Q105：学校如何支持学生参加竞赛？
答：学校提供竞赛指导教师、训练场地、设备资源、经费支持、创新学分认定和奖励机制。教师会帮助学生进行选题、方案设计、技术实现和答辩准备。学校也鼓励将竞赛成果转化为课程项目、创新创业项目或毕业设计题目。
English Answer: The university provides competition supervisors, training venues, equipment, funding, innovation credit recognition, and awards. Teachers help students with topic selection, solution design, technical implementation, and defense preparation. The university also encourages transforming competition outcomes into course projects, innovation projects, or graduation design topics.

Q106：学生是否了解本专业的 PLOs？
答：学生通过培养方案、课程大纲、课程介绍、班会和教师讲解逐步了解 PLOs。每门课程会说明其支撑的学习成果，学生在课程学习、实践项目和毕业设计过程中也能感受到这些能力要求。
English Answer: Yes. Students gradually understand PLOs through the cultivation plan, course syllabi, course introductions, class meetings, and teachers' explanations. Each course explains which learning outcomes it supports. Students can also feel these requirements through course learning, projects, internships, and graduation design.

Q107：本专业如何处理学生心理健康和学习压力？
答：学校开设大学生心理健康教育课程，辅导员和班主任也会关注学生心理状态。对于学习压力较大的阶段，教师和学院会通过答疑、学业帮扶、时间安排优化和心理支持帮助学生。竞赛和项目参与也坚持自愿原则，避免不合理增加学生负担。
English Answer: The university offers mental health education courses, and counselors and head teachers pay attention to students' psychological status. During stressful periods, teachers and the college provide Q&A, academic support, schedule optimization, and psychological support. Participation in competitions and projects is voluntary.

Q108：学生如何获得职业规划支持？
答：学校开设职业规划、就业指导与创业基础等课程，学院和就业部门也会组织就业讲座、企业宣讲、简历指导、面试指导和职业咨询。辅导员、班主任和专业教师也会结合学生兴趣和能力提供个性化建议。
English Answer: The university offers courses such as Career Planning and Career Guidance and Entrepreneurship Fundamentals. The college and employment office also organize career lectures, enterprise recruitment talks, resume guidance, interview training, and career counseling.

Q109：一门课程的成绩如何评定？过程性考核和期末考试比例如何？
答：课程成绩一般由过程性考核和期末考核两部分构成。过程性考核通常占30%—50%，包括出勤、课堂参与、作业、阶段性测试、实验报告、课程项目、综合作业等。期末考核通常占50%—70%，可以是闭卷考试、上机考试、综合作业、课程论文或项目答辩。
English Answer: Usually, a course grade consists of continuous assessment and final assessment. Continuous assessment generally accounts for 30% to 50%, including attendance, participation, assignments, quizzes, lab reports, course projects, and comprehensive assignments. The final assessment usually accounts for 50% to 70%.

Q110：考核方法是否多样，能否有效评价学习成果？
答：考核方法是多样的。课程考核包括过程性考核和终结性考核。过程性考核包括出勤、作业、实验、课堂表现、阶段性测试、项目报告、课堂讨论等；终结性考核可以采用笔试、上机考试、课程论文、大作业、项目答辩等形式。多样化考核能够更全面评价学生知识、能力与素养。
English Answer: Yes. We use both continuous and final assessments. Continuous assessment includes attendance, assignments, labs, class performance, quizzes, project reports, and discussions. Final assessment may include written exams, computer-based exams, papers, major assignments, or project defenses.

Q111：是否有基于评价结果的课程改进机制？是否形成闭环？
答：有。课程结束后，教师根据成绩、达成度、评教、督导、同行、学生反馈分析质量，对达成不足的目标调整内容、实验、案例、考核或辅导，改进措施在下一轮实施并再次验证，形成"评价—反馈—改进—再评价"闭环。
English Answer: Yes. After a course ends, teachers analyze student grades, course objective achievement, student evaluations, teaching supervision, peer review, and student feedback. If some objectives are not well achieved, the course team proposes improvements and implements them in the next round, forming a closed loop.

Q112：理论教学如何与工程实践紧密结合？
答：通过实验、课程项目、课程设计、实习、毕业设计结合。理论课引入工程案例，实验课验证理论，课程项目完成系统模块，实习进入真实企业环境，毕业设计综合运用知识解决问题。
English Answer: We connect theory and practice through experiments, course projects, course design, internships, and graduation design. In theoretical courses, teachers introduce engineering cases. In lab courses, students verify theory. In course projects, students develop complete systems or modules.

Q113：同一门课程由多位教师讲授时，如何保证一致性？
答：通过统一大纲、统一目标、统一考核、集体备课、课程组研讨保证一致性，共同确定教学内容、重难点、作业、实验、考核标准，确保不同班级目标与标准一致。
English Answer: We use a unified syllabus, unified course objectives, unified assessment requirements, collective lesson preparation, and course group discussions. The course team discusses teaching content, key points, assignments, lab projects, and assessment standards to ensure consistency.

Q114：期末考核形式由教师自由选择吗？
答：不是完全自由选择。课程考核方式必须按照课程大纲执行。专业核心课程原则上采用闭卷考试或规范化考试方式，实践性课程可以采用项目、报告、答辩等方式。课程大纲明确规定考核组成、比例和方式，教师需要按照大纲实施，不得随意改变。
English Answer: Not completely. The assessment form must follow the course syllabus. Core professional courses generally use standardized exams, while practical courses may use projects, reports, or defenses.

Q115：学生期末考试通过率如何？不及格有什么后果和补救措施？
答：不同课程通过率有差异。不及格影响绩点与学分取得，学校提供补考、重修机会，多门不及格会进行学业预警与帮扶，必须修满学分方可毕业。
English Answer: The pass rate varies by course. If a student fails a course, it affects credits and GPA. The university provides make-up exams and retake opportunities. The college provides academic warning and support for students with academic difficulties.

Q116：学生出勤率如何？迟到或旷课有什么后果？
答：总体出勤率较高。出勤是过程性考核组成部分，迟到、早退、旷课影响平时成绩，缺课达规定比例可能取消考试资格。
English Answer: Overall, attendance is relatively good. Attendance is part of continuous assessment. Being late, leaving early, or being absent may affect regular grades. If a student misses too many classes, they may lose the qualification to take the final exam.

Q117：课程体系如何培养国际化视野和跨文化交流能力？
答：通过外语、专业英语、国际交流、学术讲座、跨文化活动培养，训练英文文献阅读与专业表达，提供交流项目，鼓励参与国际竞赛与讲座。
English Answer: We mainly cultivate these through English courses, Professional English, international exchange projects, academic lectures, and cross-cultural activities. Students learn to read English technical documents and express professional ideas.

Q118：毕业设计如何评分？是否只做系统，不写文字材料？
答：不是。毕业设计需成果与文档兼备，成绩由指导教师、评阅教师、答辩委员会评分构成，评价涵盖选题、开题、文献、实现、撰写、态度、创新、答辩等。
English Answer: No. Graduation design requires both a practical outcome and written documentation. The grade usually consists of the supervisor's evaluation, reviewer's evaluation, and defense committee's evaluation.

Q119：毕业设计题目如何确定？一个教师可以指导几个学生？
答：题目由导师结合培养目标、企业需求、科研、学生能力拟定，或学生提议后审核通过。每位导师指导学生数量按校院规定执行，保障指导质量。
English Answer: Graduation design topics are usually proposed by supervisors based on programme objectives, enterprise needs, research projects, and students' ability. Students may also propose topics, but they must be reviewed and approved.

Q120：如何保证毕业设计质量？
答：实行全过程管理：选题审核、任务书、开题、中期检查、查重、评阅、答辩、归档；导师定期指导，学院督查，鼓励题目来自企业需求或科研项目，提升实践性。
English Answer: The university and college manage the whole process, including topic review, task assignment, proposal, mid-term check, plagiarism check, review, defense, and archiving. Supervisors guide students regularly.

Q121：课程内项目化教学如何匹配培养目标和 ASIIN 能力要求？
答：围绕应用型培养与 ASIIN 能力设计，将 PLO 分解为课程目标，设计贴近行业的项目任务，融入需求分析、方案设计、编码、测试、文档、答辩，同步培养知识、技能、工程思维。
English Answer: Project-based teaching is designed around our application-oriented objectives and ASIIN competence requirements. We break down the PLOs into course objectives, and then design project tasks close to industry practice.

Q122：不同课程的项目化教学是否具有递进性？如何避免重复或脱节？
答：具有递进性，按"基础认知—单项技能—综合应用—系统设计"推进，低年级练基础、中年级练综合、高年级练整合。课程组通过集体备课、大纲审核明确边界，避免重复脱节。
English Answer: Yes, it is progressive. We follow a path from basic cognition to single-skill training, then comprehensive application, and finally system design. Course teams coordinate through collective preparation and syllabus review.

Q123：项目化教学如何评价学生个人贡献？
答：采用过程+结果评价，过程看分工、日志、检查、汇报、讨论；结果看功能、代码、测试、文档、答辩。结合互评、个人答辩、提交记录避免搭便车。
English Answer: We combine process evaluation and final outcome evaluation. Process evaluation includes task division, development logs, stage checks, presentations, and discussions. Peer evaluation, individual defense, and submission records help identify each student's contribution.

Q124：如何通过项目化教学培养团队合作和沟通能力？
答：项目以小组完成，学生分工、协作、沟通、汇报，答辩用PPT与演示讲解方案，训练团队协作、沟通表达、项目管理、文档写作能力。
English Answer: Projects are usually done in groups. Students need to divide tasks, coordinate progress, collaborate, discuss problems, and present results. In project defense, they explain requirements, design, implementation, and testing.

Q125：教师科研活动如何支持课程发展？
答：科研为课程提供前沿内容、真实案例、项目资源，科研课题可转化为课程案例、竞赛题、毕业设计题，教学助力科研成果转化为育人资源。
English Answer: Faculty research brings frontier content, real cases, and project resources into teaching. Research projects can become course cases, competition topics, or graduation design topics.

Q126：学生竞赛如何结合企业人才需求？
答：竞赛强调真实问题、工程实践、团队协作，契合企业人才要求，部分题目来自企业需求，训练企业看重的工程实践、创新、沟通、项目管理能力。
English Answer: Competitions usually emphasize real problems, engineering practice, and teamwork, which match enterprise expectations. Some competition projects come from enterprise needs.

Q127：企业如何评价本专业毕业生？
答：企业认为毕业生计算机基础、编程、系统开发、学习能力较好，能适配开发、测试、数据处理、网管等岗位，建议加强复杂问题解决、项目经验、工程规范、沟通协作。
English Answer: Enterprises generally believe our graduates have good computer fundamentals, programming ability, system development ability, and learning ability. They can adapt to positions such as software development, system testing, data processing, and network management.

Q128：企业如何安排学生实习？实习目标与培养目标如何衔接？
答：企业实习采用项目驱动、双导师制，学生参与开发、测试、数据处理、运维、文档工作，目标与培养目标一致，将知识转化为实践，培养岗位适应、问题解决、团队协作能力。
English Answer: Enterprise internships usually use a project-driven model with dual supervision. Students are guided by both enterprise mentors and university supervisors. The internship objectives are closely aligned with programme objectives.

Q129：企业是否参与毕业设计或毕业论文？
答：可以参与。部分题目来自企业实际需求，企业工程师可参与选题建议、过程指导、实践评价，实习项目符合要求可转为毕业设计题目。
English Answer: Yes. Some graduation design topics come from real enterprise needs. Enterprise engineers may participate in topic suggestions, process guidance, or practical evaluation.

Q130：教学质量如何监控？
答：建立多层监控体系：学生评教、督导听课、同行听课、期初/期中/期末检查、课程档案检查、试卷检查、毕设检查、课程目标达成评价、PLO达成评价，及时发现问题推动改进。
English Answer: The university and college have a multi-level teaching quality monitoring system. It includes student evaluations, teaching supervision, peer observation, teaching checks, course archive checks, exam paper checks, graduation design checks, and PLO achievement evaluation.

Q131：学生反馈是否会被采纳？
答：会。通过评教、信息员、期中座谈会、辅导员、任课教师收集反馈，分类分析共性问题，调整教学节奏、增加案例、优化安排等。
English Answer: Yes. Student feedback is collected through the evaluation system, student information officers, mid-term meetings, counselors, and course teachers. The college summarizes and analyzes common issues and adjusts teaching pace, adds cases, or optimizes course arrangements.

Q132：如何评价考试是否能够反映学习目标达成？
答：考核对应课程目标与 PLO，依据大纲命题，考后分析成绩分布、试卷质量、目标达成度，达成不足则调整内容、考核、教法。
English Answer: Exams and assessments must correspond to course objectives and PLO indicators. Teachers design questions according to the syllabus. After exams, we analyze grade distribution, paper quality, and course objective achievement.

Q133：如何鼓励学生课堂参与和提问？
答：用提问、讨论、案例、小组汇报、课堂练习提升参与度，课堂表现纳入过程考核，营造积极氛围，鼓励提问，课后答疑与线上平台持续交流。
English Answer: Teachers use questions, discussions, case analysis, group presentations, and classroom exercises to encourage participation. Some courses include participation in continuous assessment.

Q134：课程采用的教学方法是否理想？
答：教师按课程特点选择教法：理论课用讲授、案例、讨论；实践课用实验、项目驱动、任务式；综合课用团队项目、阶段汇报、答辩，学院鼓励持续改进提升互动与效果。
English Answer: Teachers choose methods based on course characteristics. Theory-oriented courses use lectures, case analysis, and discussions. Practice-oriented courses use experiments, project-driven teaching, and task-based learning. Comprehensive courses use team projects, stage reports, and defenses.

Q135：如何开展课程目标达成评价？
答：基于课程考核数据评价，将课程目标对应试题、作业、实验、项目、答辩等，统计完成情况计算达成度，未达标则分析原因并提出改进。
English Answer: Course objective achievement is usually evaluated based on course assessment data. Teachers connect course objectives with assessment items. Then they calculate achievement levels and propose improvements if needed.

Q136：如何开展毕业要求或 PLO 达成评价？
答：基于课程支撑权重与课程目标达成结果计算，汇总数据评价整体达成，结合毕业设计、实习、考核、学生与企业反馈判断是否达成，用于持续改进。
English Answer: PLO achievement is calculated based on course support weights and course objective achievement results. Each course has quantitative support weights for specific PLO indicators. The results are summarized to evaluate overall PLO achievement.

Q137：如何开展教学持续改进？
答：分课程、专业、学院三层改进：课程层按达成与反馈改教学；专业层按 PLO、毕业生、雇主、行业需求调课程；学院层用监控与委员会推动，所有改进记录并在下一轮实施验证。
English Answer: Continuous improvement happens at course, programme, and college levels. At the course level, teachers improve teaching based on course achievement and student feedback. At the programme level, we adjust the curriculum based on PLO achievement and employer feedback.

Q138：学生 workload 如何监测？
答：ECTS换算计入课堂与自学学时，通过工作量调查、课程反馈、评教、座谈会收集学习时间，分析负担合理性，必要时调整安排与课程设计。
English Answer: We consider both contact hours and self-study hours in ECTS conversion. The college collects workload information through workload surveys, course feedback, teaching evaluations, and student meetings.

Q139：如何保证学生按时毕业？
答：合理课程安排、学业预警、补考重修、班导与辅导员帮扶、课程资源支持，对学业困难学生预警帮扶，关注负担、衔接、实践避免过载，支持标准学制内完成学习。
English Answer: The university supports on-time graduation through reasonable curriculum arrangements, academic warning, make-up exams, retakes, head teacher and counselor guidance, and course resources. For students with academic difficulties, the college provides early warning and support.

Q140：毕业率和退学率情况如何？
答：学生学习进展稳定，按期毕业比例较高，延期毕业与退学比例低，说明招生、教学、学生支持、学业管理总体有效，支撑 PLO 与培养目标达成。
English Answer: According to our academic progress data, students generally progress steadily. The proportion of on-time graduates is relatively high, while delayed graduation and dropout rates are low.

Q141：如何处理学生作弊或学术不端？
答：学校有明确学术诚信与考试纪律，禁止抄袭、作弊、代写、造假，发现后按情节处分，毕业设计查重与过程管理保障学术规范。
English Answer: The university has clear rules on academic integrity and exam discipline. Students are not allowed to plagiarize, cheat, have others complete work for them, or falsify data.

Q142：课程考试命题和阅卷如何保证规范？
答：按大纲与考试规定命题，配套标准答案与评分细则，审核、印制、保管规范，阅卷按细则执行不随意调分，试卷、成绩单、分析报告归档。
English Answer: Course exams are organized according to syllabi and exam regulations. Exam papers are designed based on course objectives and usually include standard answers and scoring rubrics.

Q143：补考、缓考和重修如何安排？
答：不及格可补考；特殊原因可提前申请缓考；补考/缓考仍不及格需重修，流程按学校考试规定执行。
English Answer: Students who fail a course can take a make-up exam. If they cannot attend an exam due to special reasons, they must apply for a deferred exam in advance. If they still fail, they need to retake the course.

Q144：外语能力如何考核？
答：学生修大学英语，按学位要求参加CET-4或校学位英语考试，英语与专业英语支撑外语应用、专业文献阅读、跨文化交流能力。
English Answer: Students take college English courses and, according to degree requirements, need to take CET-4 or the university's degree English test.

Q145：企业反馈如何用于课程改进？
答：通过企业座谈、实习反馈、毕业生跟踪、雇主调研、校企项目收集建议，针对工程实践、项目管理、沟通、新技术等建议调整内容、增加案例、优化实习、引入企业案例。
English Answer: The college collects enterprise feedback through enterprise meetings, internship feedback, graduate tracking, employer surveys, and university-enterprise projects. If enterprises suggest strengthening engineering practice, project management, communication, or new technology, we adjust course content, add project cases, improve internships, or introduce enterprise cases.

Q146：毕业生反馈如何用于培养方案修订？
答：通过跟踪调查与校友沟通收集课程有用性、实践能力、职业发展、深造需求，结合行业、教师、学生意见修订课程与能力要求。
English Answer: The college collects graduate feedback through tracking surveys and alumni communication. The feedback covers course usefulness, practical ability, career development, and further learning needs.

Q147：如何评价学生是否达到毕业学习成果？
答：通过课程考核、目标达成、PLO达成、实习评价、毕设评价、学生与企业反馈综合判断，每项 PLO 有支撑课程与数据，未达标则改进课程、教法、实践环节。
English Answer: We evaluate this through course assessment, course objective achievement, PLO achievement, internship evaluation, graduation design evaluation, student feedback, and enterprise feedback. Each PLO has supporting courses and assessment data sources.

Q148：如何保证教学材料和评价材料可追溯？
答：大纲、日历、试卷、评分标准、成绩单、分析报告、实验/项目/毕设材料按要求归档，支持质量检查、课程改进、认证审核，保障教学与评价可追溯。
English Answer: Course syllabi, teaching calendars, exam papers, scoring rubrics, grade sheets, exam analysis reports, and graduation design materials are archived according to university requirements.

Q149：本专业如何体现学生中心？
答：课程围绕11项 PLO 设计，教学用项目、案例、实践突出学生主体，提供辅导员、班导、任课教师的学业心理职业支持，学生反馈用于教学与课程改进。
English Answer: Student-centered education is reflected in curriculum design, teaching methods, learning support, feedback, and continuous improvement. Courses are designed around the 11 PLOs.

Q150：教师科研和教学之间如何相互促进？
答：科研为教学带来前沿内容、案例、项目；教学助力科研成果转化为育人资源，学生参与科研提升创新与研究能力。
English Answer: Faculty research brings frontier content, real cases, and project resources into teaching. Research projects can become course cases, competition topics, or graduation design topics.

Q151：专业如何保证学生实习质量？
答：遴选匹配专业的实习单位，双导师指导，学生完成任务、记录过程、撰写报告，接受企业与学校评价，学院通过检查、学生与企业反馈监控质量。
English Answer: The college selects internship units that match the programme's objectives. Students are guided by both university supervisors and enterprise mentors. The college also collects feedback to monitor internship quality.

Q152：如何处理课程项目与企业项目难度不匹配的问题？
答：教师对企业项目教学化改造，保留核心工程逻辑与能力目标，降低复杂度，明确功能、技术、考核标准，适合本科教学并在周期内完成。
English Answer: Teachers adapt real enterprise projects for teaching. We keep the core engineering logic and competence objectives, but simplify the complexity so undergraduate students can complete them.

Q153：毕业设计是否有查重要求？
答：有。毕业设计/论文按学校要求查重，查重结果、评阅意见、答辩记录、成绩纳入过程管理，不符合要求需修改重新提交。
English Answer: Yes. Graduation design or thesis must go through plagiarism checking according to university requirements. The checking results, review comments, defense records, and final grades are included in process management.

Q154：毕业设计优秀率是否有限制？
答：有。学校对毕设成绩分布与优秀率有管控，采用优秀、良好、中等、及格、不及格评级，优秀率控制在合理范围，保障评价严肃公平。
English Answer: Yes. The university controls the grade distribution and excellent rate of graduation design within a reasonable range.

Q155：如何保证学生评价教师不是形式化？
答：学生评教是质量评价一部分，结合督导、同行、档案、成绩、教学检查避免片面，集中反馈问题要求教师/课程组分析改进。
English Answer: Student evaluation is only one part of the teaching quality system. We also use teaching supervision, peer review, course archive checks, grade analysis, and teaching inspections.

Q156：信息员制度如何发挥作用？
答：每班信息员收集反馈教学进度、课堂秩序、作业负担、设备、学习困难等问题，上报学院协调教师或部门解决。
English Answer: Each class has student information officers who collect and report teaching-related issues. The college then coordinates with teachers or departments to solve these problems.

Q157：期中教学座谈会有什么作用？
答：学期中及时收集学生对教学、负担、授课、管理的意见，便于即时调整，不是期末才发现问题，是质量监控与持续改进重要渠道。
English Answer: Mid-term teaching meetings help collect student opinions during the semester, not only at the end. This allows teachers and the college to make timely adjustments.

Q158：如何评价项目化教学中的文档写作？
答：文档是项目评价重要部分，学生需撰写需求、设计、测试、手册、总结等，评价技术能力、工程规范、逻辑表达、沟通能力。
English Answer: Documentation is an important part of project evaluation. Students need to write requirement documents, design documents, test reports, user manuals, or project summaries.

Q159：项目答辩如何评价？
答：评价系统演示、技术路线、问题分析、创新点、团队分工、文档质量、现场答疑，了解学生是否真正理解项目与沟通表达能力。
English Answer: Project defense evaluates system demonstration, technical route, problem analysis, innovation, team division, documentation quality, and answers to questions.

Q160：小组项目如何避免少数学生承担全部工作？
答：明确分工、阶段检查、个人提交、开发日志、组内互评、个人答辩，教师关注个人具体贡献而非仅看小组成果。
English Answer: We use task division, stage checks, individual submissions, development logs, peer evaluation, and individual defense. Teachers pay attention to each student's specific contribution.

Q161：竞赛成果如何反哺教学？
答：竞赛优秀案例、技术方案、项目经验转化为课程案例、实验、教学资源，教师根据竞赛发现短板改进课程与实践训练。
English Answer: Good cases, technical solutions, and project experience from competitions can be transformed into course cases, lab projects, or teaching resources.

Q162：企业对学生实习表现如何评价？
答：从工作态度、学习能力、专业基础、工程实践、沟通协作、岗位适应评价，学生基础与学习能力较好，能完成开发、测试、数据处理任务，建议加强真实项目与工程规范。
English Answer: Enterprises usually evaluate students in terms of work attitude, learning ability, professional foundation, engineering practice, communication, teamwork, and workplace adaptation.

Q163：专业如何回应企业关于人才培养的建议？
答：将企业建议纳入培养方案、课程更新、实践改进，如加强AI、大数据、项目管理、软件测试，则优化课程、增加案例、强化课设与实习要求。
English Answer: We include enterprise suggestions in cultivation plan revision, course updates, and practical teaching improvement.

Q164：企业导师参与教学有什么价值？
答：带来真实项目经验、岗位要求、行业规范，帮助学生理解知识应用，参与讲座、实习指导、评审、毕设指导，提升培养实践性与行业适配性。
English Answer: Enterprise mentors bring real project experience, job requirements, and industry standards. Their participation in lectures, internship guidance, project review, and graduation design improves the practicality and industry relevance of training.

Q165：学生是否参与专业建设反馈？
答：参与。通过评教、教学座谈会、信息员、工作量调查、毕业生调查、学生代表座谈提意见，作为课程改进与培养方案修订重要依据。
English Answer: Yes. Students participate through course evaluations, teaching meetings, information officer feedback, workload surveys, graduate surveys, and student representative meetings.

Q166：如何用一句话概括本专业质量保障？
答：本专业通过学生评教、督导听课、课程目标达成评价、PLO达成评价、毕业生和用人单位反馈等方式形成持续改进闭环，保障培养目标和学习成果达成。
English Answer: The programme forms a continuous improvement loop through student evaluation, teaching supervision, course objective achievement evaluation, PLO achievement evaluation, graduate feedback, and employer feedback.

Q167：毕业生在工作岗位上能否适应？
答：从培养目标看，本专业毕业生应能在IT行业、科研机构、企事业单位和公共服务部门从事系统分析、设计、开发、测试、管理和服务等工作。通过课程学习、实践教学、实习和毕业设计，大多数学生具备基本岗位适应能力。
English Answer: From the programme objectives, graduates are expected to work in IT companies, research institutes, enterprises, and public organizations in areas such as system analysis, design, development, testing, management, and services.

Q168：课程体系如何培养国际化视野和跨文化交流能力？
答：主要通过外语课程、专业英语课程、国际交流项目、国际学术讲座和跨文化交流活动培养。学生学习大学英语和专业英语，训练英文技术文档阅读、专业表达和基本学术沟通能力。学校和学院也提供赴澳门、澳大利亚等地的交流项目。
English Answer: We mainly cultivate these through English courses, Professional English, international exchange projects, academic lectures, and cross-cultural activities. Students learn to read English technical documents, express professional ideas, and conduct basic academic communication.

Q169：教师是否参加国际合作或海外交流？
答：学校和学院鼓励教师参加国际学术会议、海外访学、国际合作研究和交流访问。教师通过国际交流可以了解学科前沿、拓宽国际视野，并将相关内容反馈到课程教学和科研训练中。
English Answer: Yes. The university and college encourage teachers to attend international conferences, visit overseas universities, conduct international research cooperation, and participate in exchange visits.

Q170：企业如何参与竞赛过程？产教融合如何落地？
答：企业可以通过提供真实问题、担任项目导师、参与过程指导、担任评委、提供平台资源和推动成果转化等方式参与竞赛。学校也通过校企合作基地、产业学院、联合实验室和企业导师机制，把企业需求引入课程、竞赛、实习和毕业设计中。
English Answer: Enterprises can participate by providing real topics, serving as mentors, giving process guidance, acting as judges, offering technical platforms, and supporting outcome transformation.

Q171：企业与学校的合作包括哪些方面？
答：校企合作主要包括实习基地建设、企业讲座、课程案例共建、实践项目、毕业设计选题、学生实习就业、教师企业实践和科研合作等方面。通过合作，学生可以接触企业真实项目和岗位要求，教师可以了解行业发展。
English Answer: Cooperation includes internship base construction, enterprise lectures, joint course cases, practical projects, graduation design topics, student internship and employment, teacher enterprise practice, and research cooperation.

Q172：企业如何评价本专业毕业生？
答：从企业角度看，本专业毕业生具备较好的计算机基础知识、编程能力、系统开发能力和学习能力，能够适应软件开发、系统测试、数据处理、网络管理等基础岗位。企业也希望学生进一步加强复杂工程问题解决能力、项目经验、工程规范意识和沟通协作能力。
English Answer: Enterprises generally think graduates have good computer science fundamentals, programming ability, system development ability, and learning ability. They can adapt to positions such as software development, testing, data processing, and network management.

Q173：企业如何安排学生实习？实习目标与培养目标如何衔接？
答：企业实习通常采用项目驱动和双导师指导模式。学生在企业导师和校内导师共同指导下，参与系统开发、测试、数据处理、运维支持、技术文档等工作。实习目标与培养目标高度一致，都是为了将课堂知识转化为工程实践能力。
English Answer: Enterprise internships usually use real projects and dual guidance. Students work under both enterprise mentors and university supervisors. The goal is to transform classroom knowledge into engineering practice and develop workplace adaptability.

Q174：企业是否参与毕业设计或毕业论文？
答：可以参与。部分毕业设计题目来源于企业实际需求，企业工程师可以参与题目建议、过程指导或实践评价。学生在企业实习期间形成的项目也可以在符合学校要求的情况下转化为毕业设计题目。
English Answer: Yes. Some graduation design topics come from enterprise needs. Enterprise engineers can participate in topic suggestion, process guidance, and practical evaluation.

Q175：国际化对教师发展有什么作用？
答：教师通过参加国际会议、海外访问、国际合作研究和国际课程交流，可以了解国际学科前沿和教育教学方法。这些经历有助于教师更新课程内容、提升学术水平和教学能力，也能为学生提供更开阔的国际视野和跨文化交流机会。
English Answer: Internationalization helps teachers learn about academic frontiers, international teaching methods, and global industry trends. Through international conferences, overseas visits, cooperation research, and course exchange, teachers can update course content and improve academic ability.

Q176：专业如何开展校企合作？
答：专业通过校企合作协议、实习基地、企业讲座、企业导师、联合项目、教师企业实践和学生实习等方式开展合作。合作企业可以参与实践教学、实习指导、项目评审和人才需求反馈。校企合作有助于提高课程实践性和学生岗位适应能力。
English Answer: The programme carries out cooperation through agreements, internship bases, enterprise lectures, enterprise mentors, joint projects, teacher enterprise practice, and student internships. Enterprises participate in practical teaching, internship guidance, project review, and feedback on talent needs.

【学生座谈会问答材料】

问题1：你认为本专业重点培养了哪些核心能力？
答：本专业主要培养应用型计算机工程技术人才。PLOs包括11个方面：工程知识、问题分析、设计/开发解决方案、研究、使用现代工具、工程与可持续发展、工程伦理和职业规范、个人与团队、沟通、项目管理和终身学习。通过C程序设计，学生独立完成小型系统开发；通过数据结构和算法设计与分析，培养抽象问题、设计算法和分析复杂度的能力；通过软件工程和智能应用系统开发，学习需求分析、系统设计、团队协作和项目管理。

问题2：你如何获取培养方案、培养目标、毕业要求和课程体系？
答：我们主要通过学校教学管理系统查看培养方案、课程安排和修读要求；每门课程的教学大纲中会说明课程目标、课程内容、考核方式以及支撑哪些毕业学习成果；课程开始时，任课教师会介绍课程目标、学习要求、考核比例和课程与专业能力培养之间的关系；学院也会通过班会、专业介绍、导师指导等方式帮助我们理解专业培养目标和课程体系。

问题3：入学前后你对本专业的理解有哪些变化？
答：入学前，认为计算机科学与技术专业就是学习编程、写代码。进入大学后，逐渐认识到这个专业不仅包括编程，还包括数学基础、计算机系统、算法设计、数据库、网络、操作系统、软件工程、人工智能等多个方面。特别是通过项目化教学和课程设计，我对专业的理解发生了明显变化。

问题4：你认为本专业毕业后可以从事哪些工作？
答：毕业后可以在IT行业、科研机构、企事业单位和公共服务部门从事计算机应用相关工作，例如软件开发、系统设计、Web开发、移动应用开发、数据库管理、算法设计、数据处理与分析、人工智能应用开发、系统测试、网络管理和项目管理等岗位。

问题5：你如何理解工程师的责任？
答：工程师不仅要掌握技术，更要有社会责任感和工程伦理意识。对于计算机专业来说，我们设计和开发的软件系统、数据系统、网络系统和人工智能应用都会影响用户、企业甚至社会运行。因此，在工程实践中，需要考虑系统的安全性、可靠性、隐私保护、可维护性和可持续发展问题。

问题6：课程体系是否层层递进、逻辑清晰？
答：是的。课程按照"基础知识—专业核心—综合应用—工程实践—持续发展"的逻辑逐步推进。低年级学习高等数学、线性代数、离散数学、Python程序设计、C程序设计等基础课程；中年级学习数据结构、数据库、计算机网络、操作系统、算法设计与分析等核心课程；高年级学习软件工程、人工智能、机器学习、智能应用系统开发等专业课程，以及课程设计、专业实习和毕业设计等实践环节。

问题7：课程体系如何支撑能力培养？
答：专业通过三层对齐关系保证课程体系支撑能力培养。课程与毕业要求支撑矩阵明确每门课程支撑哪些毕业学习成果；目标课程矩阵把11项毕业要求映射到相关课程模块；毕业要求与培养目标支撑矩阵说明各项学习成果如何支撑长期培养目标。

问题8：专业如何培养学生国际化视野？
答：专业是江苏省高校国际化人才培养品牌专业，开设全英文课程，引进国际化师资。与澳大利亚麦考瑞大学、澳门城市大学等开展人工智能交流项目。学生可以参与国际交流项目，提升国际视野和跨文化沟通能力。

【专业基本情况数据】

师资队伍：
- 专任教师16人：正高2人、副高4人、讲师10人
- 博士学位8人，硕士学位8人
- 有境外学习经历教师2人

课程建设：
- 国家一流课程1门
- 省级一流课程5门
- 省级在线开放课程2门
- 教学研究项目71项
- 发表教学改革论文412篇
- 授权专利89项

科研：
- 市厅级以上项目127项
- 横向项目到账经费1805.1万元
- 省级平台1个，市级平台4个

学生数据（2025年）：
- 招生201人
- 毕业88人
- 学位授予率100%
- 考研率18%
- 就业率100%

学生科创：
- 学科竞赛获奖325人次
- 大学生创新创业项目168人次
- 学生专利32项`;

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
- Use ONLY common, everyday English words
- Keep sentences SHORT and SIMPLE
- Do NOT use italics
- Keep the meaning EXACTLY the same as the original
- Do NOT add or remove information

Word guide:
- 培养 → develop / train
- 课程 → course / class
- 专业 → program / major
- 团队 → team
- 沟通 → talk / communicate
- 国际化 → international
- 可持续发展 → sustainable development
- 工程伦理 → engineering ethics
- 项目管理 → project management
- 终身学习 → keep learning

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
