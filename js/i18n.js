// Runtime bilingual layer. The HTML keeps the Chinese source text; this module
// swaps visible text and key attributes to English on demand and restores the
// Chinese originals. Chinese is the default; the choice persists per browser.
// English wording follows the original TwinHospital site wherever the Chinese
// text is unchanged. Containers marked [data-i18n-skip] are rendered by
// app.js, which re-renders them on the `langchange` event.
(() => {
  const EN = {
    // chrome
    '跳到主要内容': 'Skip to main content',
    'TwinHospital2 首页': 'TwinHospital2 home',
    '切换导航菜单': 'Toggle navigation menu',
    '主要导航': 'Main navigation',
    '数字院区': 'Campus',
    '运行基础': 'Foundation',
    '交互体验': 'Demo',
    '岗位协作': 'Roles',
    '实验验证': 'Results',
    '未来工作': 'Future work',
    '联系': 'Contact',
    '切换语言': 'Switch language',
    '图 1': 'Figure 1', '图 2': 'Figure 2', '图 3': 'Figure 3', '图 4': 'Figure 4',
    '图 5': 'Figure 5', '图 6': 'Figure 6', '图 7': 'Figure 7', '图 8': 'Figure 8',
    '表 1': 'Table 1', '表 2': 'Table 2', '表 3': 'Table 3',
    '视频 1': 'Video 1', '视频 2': 'Video 2', '视频 3': 'Video 3',
    '关闭': 'Close',
    '关闭视频': 'Close video',
    '关闭大图': 'Close image',

    // hero
    '数字医院研究原型': 'Digital hospital research prototype',
    '让医院在': 'Run hospitals',
    '数字世界': 'in the digital world',
    '中运行': '',
    'TwinHospital2 以真实 HIS 数据流连接医院空间与多角色协作，为 AI 验证、诊疗流程创新和医院运行优化提供可控的仿真试验场。':
      'TwinHospital2 connects hospital space and multi-role collaboration through real HIS data flows — a controllable testbed for AI validation, care-workflow innovation, and hospital operations.',
    '研究边界': 'Research boundaries',
    '研究原型': 'Research prototype',
    '合成数据': 'Synthetic data',
    '本地受控部署': 'Local controlled deployment',
    '不提供诊疗建议': 'No medical advice',
    '体验核心流程': 'Explore the core workflow',
    '查看数字院区': 'View the campus',
    '参与单位': 'Institutions',
    '香港中文大学（深圳）': 'The Chinese University of Hong Kong, Shenzhen',
    '深圳河套学院': 'Shenzhen Loop Area Institute',
    '资源': 'Resources',
    '论文 · arXiv': 'Paper · arXiv',
    '代码 · GitHub': 'Code · GitHub',
    '数据 · Hugging Face': 'Data · Hugging Face',
    '视频 · YouTube': 'Video · YouTube',
    '论文 arXiv（链接待补充）': 'arXiv paper (link pending)',
    '代码 GitHub（链接待补充）': 'GitHub repository (link pending)',
    '数据 Hugging Face（链接待补充）': 'Hugging Face data (link pending)',
    '视频 YouTube（链接待补充）': 'YouTube video (link pending)',
    'Agent 在 OpenHIS 中执行门诊挂号查询': 'An Agent runs an outpatient registration query in OpenHIS',
    '放大查看 Agent 操作 OpenHIS 的截帧': 'Enlarge the frame of the Agent operating OpenHIS',
    'Agent 浏览器实录截帧：左侧为 OpenHIS 门诊挂号界面，右侧为同步记录的训练轨迹与模型决策':
      'Frame from the Agent browser recording: the OpenHIS outpatient registration screen on the left, the synchronised trace and model decisions on the right',
    'Agent 在 OpenHIS 门诊挂号界面执行查询任务；右侧为同步记录的模型决策与操作轨迹。取自浏览器实录第 36 秒。':
      'An Agent runs a query task in the OpenHIS outpatient registration screen; on the right, the model’s decisions and action trace recorded alongside. Frame taken at 0:36 of the browser recording.',

    '实时示意 · 合成数据': 'Live illustration · synthetic data',
    '医护': 'Clinical staff',
    '后勤': 'Logistics',
    '向下浏览': 'Scroll to explore',

    // facts
    '核心规模': 'Key figures',
    '栋功能楼宇': 'functional buildings',
    '个楼层场景': 'floor scenes',
    '个医院空间': 'hospital spaces',
    '个稳定人员身份': 'stable staff identities',
    '类岗位 Agent': 'role-based Agent types',
    '项对照实验': 'controlled experiments',

    // 01 campus
    '先看看这座医院': 'Start with the hospital itself',
    'TwinHospital2 按真实医院的职能分区建成：门急诊与医技、住院病区、手术重症、药学供应、健康管理、行政与后勤各自成栋，科室、房间和工作点都拥有稳定身份。患者前来就诊，医护在岗位间协作，空间不是一张背景图，而是每一项业务真实发生的地点。':
      'TwinHospital2 is laid out by real hospital functions: outpatient and diagnostics, inpatient wards, surgery and critical care, pharmacy supply, health management, and administration and logistics each occupy their own building. Every department, room, and work point has a stable identity. Patients arrive, staff collaborate across posts, and space is no backdrop — it is where every task actually happens.',
    '数字院区总平面示意，楼宇代号与回放录像一致；不按比例绘制。将指针移到楼宇上，或在表 1 中选择，即可对照查看。':
      'Site plan of the digital campus (schematic, not to scale); building codes match the replay recordings. Hover a building, or pick it in Table 1, to compare.',
    '院区楼宇登记': 'Campus building register',
    '代号': 'Code',
    '楼宇': 'Building',
    '楼层': 'Floors',
    '空间': 'Spaces',
    '门急诊医技楼': 'Outpatient & medical technology',
    '住院综合楼': 'Inpatient complex',
    '手术重症中心': 'Surgery & critical care',
    '药学供应楼': 'Pharmacy & supply',
    '健康管理中心': 'Health management',
    '行政信息楼': 'Administration & IT',
    '后勤仓储中心': 'Logistics & warehouse',
    '合计 7 栋': 'Total, 7 buildings',
    '每个空间都有稳定 ID，绑定所属楼宇与楼层。例如挂号收费处、心血管内科、手术室、药房与护理单元。':
      'Every space has a stable ID bound to its building and floor — the registration desk, cardiology clinic, operating rooms, pharmacy, and nursing units.',
    '院区巡览 · 20 秒循环': 'Campus tour · 20 s loop',
    '播放巡览': 'Play tour',
    '暂停巡览': 'Pause tour',
    '院区巡览，20 秒无声循环，进入视野时自动播放。仿真画面录像：院区以像素风格可视化，楼宇代号 A–G 与图 1 一致。':
      'Campus tour, a 20-second silent loop that plays when it scrolls into view. Simulation screen recording: the campus is visualised in a pixel style; building codes A–G match Figure 1.',
    'TwinHospital2 数字院区巡览：院区鸟瞰、门急诊楼层、病区与药房': 'TwinHospital2 campus tour: aerial campus, outpatient floors, wards, and pharmacy',

    // 02 foundation
    '真实 HIS 驱动': 'Powered by a real HIS',
    'Agent 通过业务界面执行任务，操作结果落实为系统中的业务记录。':
      'Agents execute tasks through the business UI, and every action lands as a business record in the system.',
    'OpenHIS 管理员工作台': 'OpenHIS admin workbench',
    '放大查看 OpenHIS 管理员工作台': 'Enlarge the OpenHIS admin workbench',
    'OpenHIS 管理员工作台界面配图，包含医生、护士、收费处、药房和管理员五组业务入口':
      'OpenHIS admin workbench with five groups of entries: physician, nurse, cashier, pharmacy, and administrator',
    'OpenHIS 管理员工作台：医生、护士、收费处、药房与管理员五组业务入口。':
      'OpenHIS admin workbench: five groups of business entries — physician, nurse, cashier, pharmacy, and administrator.',
    '人员与岗位': 'Staff & roles',
    '为岗位分工、权限绑定与任务执行提供基础。': 'The basis for role division, permission binding, and task execution.',
    '岗位示例': 'Sample roles',
    '临床岗位': 'Clinical',
    '医技与手术岗位': 'Medical technology & surgery',
    '支持与保障岗位': 'Support & logistics',
    '专科医生、责任护士、药师、检验技师、检查技师、康复治疗师、营养师':
      'Specialist physician, primary nurse, pharmacist, lab technologist, imaging technologist, rehabilitation therapist, dietitian',
    '手术医师、麻醉医师、重症护士、病理技师、静配药师、财务专员':
      'Surgeon, anesthesiologist, ICU nurse, pathology technologist, compounding pharmacist, finance specialist',
    '窗口服务专员、行政专员、仓储员、信息工程师、设备工程师、洁净区工作人员':
      'Front-desk specialist, administrative specialist, warehouse clerk, IT engineer, equipment engineer, clean-zone staff',

    // 03 mission
    '研究定位': 'Research',
    '临床工作在 HIS 里完成，': 'Clinical work happens in the HIS,',
    '仿真也应如此': 'and so should simulation',
    '已有的医院仿真多聚焦 Agent 对话或患者流量，后端是简化的。但在真实医院里，医生不会一次拿到患者的全部信息——他在挂号、病历、检验、报告之间逐步取用和写入，HIS 定义了这些数据如何产生和流转。TwinHospital2 把真实 HIS 作为可执行的基础设施，让仿真承担同样的约束。':
      'Most hospital simulations focus on agent dialogue or patient flow, with a simplified backend. In a real hospital a physician never receives all patient information at once — records, orders, lab results, and reports are retrieved and written step by step, and the HIS defines how that data is created and moves. TwinHospital2 treats a real HIS as executable infrastructure, so simulation carries the same constraints.',
    '可信证据': 'Verifiable evidence',
    '每步画面与动作同时入库，操作结果落实为 HIS 中的业务记录': 'Every screen and action is stored, and every result lands as a business record in the HIS',
    '轨迹归档': 'Trace archival',
    '岗位 Agent': 'Role Agents',
    '本人账号 · 通过浏览器操作业务界面': 'Own account · works through the business UI in a browser',
    '真实 HIS': 'Real HIS',
    '挂号': 'Registration',
    '病历': 'Records',
    '医嘱': 'Orders',
    '检验': 'Lab',
    '报告': 'Reports',
    '处方': 'Prescriptions',
    '收费': 'Billing',
    '发药': 'Dispensing',
    '任务绑定员工、患者、就诊与环境版本': 'Each task binds a staff member, patient, encounter, and environment version',
    '医院空间': 'Hospital space',
    '栋 ·': 'buildings ·',
    '层 ·': 'floors ·',
    '个空间': 'spaces',
    'TwinHospital2 的运行结构：空间与人员身份是基础，真实 HIS 是执行底座，岗位 Agent 在其上工作，每一步留下可核查的证据。':
      'How TwinHospital2 runs: space and staff identities are the foundation, the real HIS is the execution substrate, role Agents work on top of it, and every step leaves verifiable evidence.',
    'HIS 是执行底座，': 'The HIS is the execution substrate,',
    '不是数据库': 'not a database',
    '挂号、医嘱、检验、处方与收费各模块保持真实接口和数据结构，业务按真实时序在模块之间流转，而不是直接写库。':
      'Registration, orders, lab, prescriptions, and billing keep real interfaces and data structures; work flows between modules in real sequence rather than writing straight to a database.',
    '真实 HIS 数据流': 'Real HIS data flow',
    'Agent 以员工身份受权限约束': 'Agents act as employees, bounded by permissions',
    '每个任务绑定员工、患者、就诊和环境版本。Agent 使用本人账号操作真实业务界面，拿不到本岗位之外的权限。':
      'Every task binds a staff member, patient, encounter, and environment version. Agents work through the real UI with their own account and cannot exceed their post.',
    '独立身份 Agent': 'Agent with its own identity',
    '进真实医院之前就能验证': 'Validate before entering a real hospital',
    '新的分诊流程、排班策略或 AI 决策先在这里运行，受真实工作流、权限与时序检验，再决定是否进入临床。':
      'New triage flows, staffing policies, or AI decisions run here first — tested against real workflows, permissions, and timing — before anyone decides to enter clinical use.',
    '部署前验证': 'Pre-deployment validation',

    // 04 demo
    '一次门诊任务 · 交互演示': 'One outpatient visit · Interactive demo',
    '一次门诊任务，': 'One outpatient visit,',
    '从入院到离院': 'from arrival to discharge',
    '一次门诊经过六个阶段，每个阶段都由一个岗位在 HIS 中完成对应业务。下表列出各阶段的执行岗位与 HIS 业务，点击阶段可从该时刻播放院内完整回放。切换到「Agent 如何操作」，可以看到 Agent 以员工身份在浏览器中操作 HIS 的实录。':
      'One outpatient visit passes through six stages, and at each stage a post completes the corresponding work in the HIS. The table lists the executing post and HIS module for each stage; click a stage to play the full in-hospital replay from that moment. Switch to “How the Agent operates” to watch the Agent work in the HIS with its own staff account.',
    '核心演示模式': 'Demo modes',
    '医院如何运行': 'How the hospital runs',
    '患者、空间、岗位与 HIS 工作流': 'Patients, space, roles, and HIS workflow',
    'Agent 如何操作': 'How the Agent operates',
    '任务配置、浏览器操作与轨迹归档': 'Task setup, browser actions, trace archival',
    '门诊路径：六个阶段的患者动线、执行岗位与 HIS 业务。阶段下方为视频 2 中的时间点，点击阶段即从该时刻播放。':
      'Outpatient pathway: the patient route, executing post, and HIS module at each of the six stages. Times under each stage refer to Video 2; select a stage to play from that moment.',
    '阶段': 'Stage',
    '入院': 'Arrival',
    '问诊': 'Consultation',
    '缴费': 'Payment',
    '离院': 'Discharge',
    '患者动线': 'Patient route',
    '执行岗位': 'Executing post',
    'HIS 业务': 'HIS module',
    '到达门急诊医技楼': 'Arrives at the outpatient building',
    '前往挂号收费处': 'Goes to the registration desk',
    '进入门诊诊室': 'Enters the consulting room',
    '回到挂号收费处': 'Returns to the cashier desk',
    '前往门急诊药房': 'Goes to the outpatient pharmacy',
    '完成就诊离开': 'Leaves after the visit',
    '挂号收费处': 'Registration & cashier',
    '医生': 'Physician',
    '药师': 'Pharmacist',
    '门诊挂号': 'Outpatient registration',
    '门诊医生站：病历、医嘱与处方': 'Outpatient physician station: records, orders, prescriptions',
    '门诊收费': 'Outpatient billing',
    '审方与门诊发药': 'Prescription review and dispensing',
    '院内完整回放 · 一次门诊任务': 'Full in-hospital replay · one outpatient visit',
    '院内完整回放 · 一次门诊任务，1 分 26 秒。仿真画面录像：院内场景以像素风格可视化，结尾为同一就诊在 OpenHIS 中的处方记录。历史验收回放，只读，不执行新的 HIS 写入。':
      'Full in-hospital replay of one outpatient visit, 1 min 26 s. Simulation screen recording: scenes are visualised in a pixel style; it ends with the same visit’s prescription record in OpenHIS. A historic acceptance replay — read-only, no new HIS writes.',
    'Agent 浏览器实录 · 操作 HIS 全过程': 'Agent browser recording · full HIS session',
    '浏览器实录 · Agent 以本人账号操作 HIS，每步画面与动作同时入库':
      'Browser recording · the Agent works in the HIS with its own account; every screen and action is stored',
    'Agent 操作步骤': 'Agent operation steps',
    '任务配置': 'Task setup',
    '填写目标': 'Define goal',
    '启动执行': 'Start run',
    '登录 HIS': 'Sign in to HIS',
    '打开工作台': 'Open workbench',
    '进入挂号并查询': 'Register & query',
    '任务结束': 'Task finished',
    '下载轨迹数据': 'Download trace data',

    // 05 roles
    '医院岗位架构': 'Role architecture',
    '一座由岗位 Agent': 'A hospital where role-based Agents',
    '协作的医院': 'work together',
    '一次就诊需要多个岗位接力。上面的回放里，从入院到离院的每一步都由某个岗位执行：医生、护士、药师各自拥有身份、权限和工作台，采购与后勤提供运行保障。':
      'One visit needs several roles handing off. In the replay above, every step from arrival to discharge is executed by a post: physicians, nurses, and pharmacists each hold their own identity, permissions, and workbench, while procurement and logistics keep operations running.',
    'TwinHospital2 医院岗位架构': 'TwinHospital2 role architecture',
    '医生、护士、药师与采购 Agent 通过各自的浏览器操作统一 HIS；HIS 按角色控制权限；问诊对话、Agent 决策、GUI 操作与 HIS 业务记录构成一条全过程可见的数据流。':
      'Physician, nurse, pharmacist, and procurement Agents operate one HIS through their own browsers; the HIS controls permissions by role; consultation dialogue, Agent decisions, GUI actions, and HIS records form one fully visible data flow.',
    '患者': 'Patient',
    '症状 · 问诊': 'Symptoms',
    '诊断 · 医嘱': 'Diagnosis',
    '门诊科': 'OUTPATIENT',
    '护理部': 'NURSING',
    '药房': 'PHARMACY',
    '采购部': 'PROCUREMENT',
    '医生 Agent': 'Physician Agent',
    '护士 Agent': 'Nurse Agent',
    '药师 Agent': 'Pharmacist Agent',
    '采购员 Agent': 'Procurement Agent',
    '采购与后勤 Agent': 'Procurement & Logistics Agent',
    '每个 Agent 的 GUI 浏览器': 'A GUI browser per Agent',
    '统一 HIS 系统': 'Unified HIS',
    '角色权限控制': 'Role-based access',
    '医生：病历 · 医嘱': 'Physician: records · orders',
    '护士：护理执行': 'Nurse: nursing execution',
    '药师：处方 · 发药': 'Pharmacist: prescriptions · dispensing',
    '采购：库存 · 采购': 'Procurement: stock · purchasing',
    '实时数据流': 'Live data flow',
    '问诊对话': 'Consultation',
    'Agent 决策': 'Agent decision',
    'GUI 操作': 'GUI action',
    'HIS 业务记录': 'HIS record',
    '全过程可见': 'Fully visible',
    '医院岗位架构：医生、护士、药师与采购 Agent 通过各自的浏览器操作统一 HIS，权限按岗位控制，全过程留痕。':
      'Role architecture: physician, nurse, pharmacist, and procurement Agents operate one HIS through their own browsers; permissions follow each post, and every step is logged.',
    '临床': 'Clinical',
    '护理': 'Nursing',
    '药事': 'Pharmacy',
    '运营': 'Operations',
    '问诊、病历、医嘱与处方签署均通过医生自己的 HIS 工作台完成。':
      'Consultation, records, orders, and prescription signing all happen in the physician’s own HIS workbench.',
    '接收医嘱、核对患者并记录护理执行，不继承医生权限。':
      'Receives orders, verifies the patient, and records nursing execution — without inheriting physician permissions.',
    '独立完成审方、配药和发药，并核对真实库存流水。':
      'Reviews prescriptions, dispenses, and issues medication independently, reconciling against real stock movements.',
    '处理采购、入库和保障工作单，让非临床业务进入同一条运行链路。':
      'Handles purchasing, receiving, and support work orders so non-clinical work joins the same operating chain.',

    // 06 results
    '先在仿真里跑一遍，': 'Run it in simulation first,',
    '再决定是否进入医院': 'then decide whether it enters the hospital',
    '八项实验覆盖四类问题：临床任务的生成质量、Agent 的端到端执行、故障与权限边界，以及医院运营中的排班与资源调度。所有实验都在同一套 HIS 驱动环境下对照运行，差异只来自被检验的那一项。':
      'Eight experiments cover four areas: the quality of clinical task generation, end-to-end Agent execution, failure and permission boundaries, and the staffing and resource scheduling of hospital operations. All run in the same HIS-driven environment, with only the item under test varying.',
    '示例数据': 'SAMPLE DATA',
    '以下数字为示例数据，用于演示版式；正式结果以论文实验章节为准。':
      'The figures below are sample data for layout; official results follow the paper’s experimental section.',
    '六项时间指标：对照与 TwinHospital2 方案（分钟）': 'Six time measures: comparison vs. TwinHospital2 (minutes)',
    '对照': 'Comparison',
    'TwinHospital2 方案': 'TwinHospital2',
    '每行左侧为指标与实验编号，圆点分别为对照（人工流程、基线或先到先得）与 TwinHospital2 方案的取值，右侧为相对变化；带 ! 标记的为成本上升或未达目标的指标。完整数值见表 3。':
      'Each row shows a measure and its experiment number; the dots mark the comparison (manual process, baseline, or first-come-first-served) and the TwinHospital2 condition, with the relative change on the right. A ! marks a cost increase or a missed target. Full values are in Table 3.',
    '八项对照实验的主要结果（示例数据）': 'Main results of the eight controlled experiments (sample data)',
    '指标': 'Measure',
    '结果': 'Result',
    '对照或计数': 'Comparison or count',
    '差异': 'Difference',
    '处方生成与药师复核': 'Prescription generation and pharmacist review',
    '医生 Agent 通过自己的 HIS 工作台开具处方，药师 Agent 独立审方；对照医生人工开具的处方，观察生成正确率与审核一致性。480 张处方。':
      'The physician Agent issues prescriptions in its own HIS workbench and the pharmacist Agent reviews them independently; measured against physician-written prescriptions for correctness and review agreement. 480 prescriptions.',
    '处方开具成功率': 'Prescription success rate',
    '药师复核一致率': 'Pharmacist agreement',
    '对照人工处方': 'vs. manual',
    '单张处方平均耗时': 'Avg. time per prescription',
    '38 秒': '38 s',
    '人工 2.4 分钟': 'manual 2.4 min',
    '要不要加入预问诊环节': 'Should we add a pre-consultation stage?',
    '把「是否在挂号与问诊之间加入护士预问诊」当作一个运筹决策：对照直接问诊与预问诊后问诊两种流程，比较医生负载与在院时长。480 次门诊。':
      'Treats “add a nurse pre-consultation between registration and consultation” as an operations decision, comparing direct consultation with the pre-consultation flow on physician load and length of stay. 480 visits.',
    '医生问诊时长': 'Consultation time',
    '8.7 分钟': '8.7 min',
    '基线 12.4 分钟': 'baseline 12.4 min',
    '问诊前信息完整度': 'Information completeness before consultation',
    '基线 63%': 'baseline 63%',
    '患者在院总时长': 'Total time in hospital',
    '23.5 分钟': '23.5 min',
    '基线 19.6 分钟': 'baseline 19.6 min',
    '病历自动生成与医生签署': 'Automated record drafting and physician sign-off',
    '根据问诊记录和 HIS 中的检验、医嘱数据生成病历草稿，由医生修改后签署；对照医生手写病历，观察字段完整率与医生修改量。200 份病历。':
      'Drafts records from consultation notes plus HIS lab and order data, for the physician to edit and sign; measured against physician-written records for field completeness and edit volume. 200 records.',
    '病历字段完整率': 'Field completeness',
    '对照手写': 'vs. handwritten',
    '医生修改量 · 每份': 'Physician edits · per record',
    '18 字': '18 chars',
    '中位数': 'median',
    '与 HIS 记录一致率': 'Agreement with HIS records',
    '双读核验': 'double-read check',
    '跨岗位端到端完成率': 'Cross-role end-to-end completion',
    '一个患者从挂号走到取药，由挂号员、医生、检验、收费、药师五个岗位的 Agent 接力完成；任一环节失败即判为未完成。320 次就诊。':
      'One patient goes from registration to medication pickup, handed off across five role Agents — registration, physician, lab, cashier, pharmacist. Any failed step counts as incomplete. 320 visits.',
    '端到端完成率': 'End-to-end completion',
    '端到端平均耗时': 'Avg. end-to-end time',
    '18.6 分钟': '18.6 min',
    '人工 26.8 分钟': 'manual 26.8 min',
    '每 10 次就诊的人工介入': 'Manual interventions per 10 visits',
    '4.2 次': '4.2',
    '目标 ≤2': 'target ≤2',
    '未达目标': 'target not met',
    '故障注入与恢复': 'Fault injection and recovery',
    '在任务执行中注入断网、页面过期、会话超时与 HIS 回执未知，观察系统能否恢复，以及是否把未确认的结果误记为成功。240 次注入。':
      'Injects network loss, expired pages, session timeouts, and unknown HIS receipts during execution, checking whether the system recovers and whether unconfirmed results are ever recorded as success. 240 injections.',
    '恢复成功率': 'Recovery rate',
    '未确认即记成功': 'Unconfirmed recorded as success',
    '0 次': '0',
    '全部拦截': 'all blocked',
    '「结果未知」识别准确率': '“Unknown outcome” detection',
    '人工复核': 'manual review',
    '越界任务的拒绝率': 'Rejection of out-of-scope tasks',
    '向不同岗位的 Agent 派发超出职责的任务（药师开处方、护士改医嘱、收费员复核退费），检查是被拒绝，还是越权写入了 HIS。1,500 次越界尝试。':
      'Assigns tasks beyond each post — a pharmacist writing prescriptions, a nurse editing orders, a cashier approving refunds — and checks whether they are rejected or written into the HIS. 1,500 attempts.',
    '越界拒绝率': 'Out-of-scope rejection',
    '越权写入 HIS': 'Unauthorized HIS writes',
    '拒绝理由待补充': 'Rejection reasons to improve',
    '9 次': '9',
    '排班与交接班': 'Staffing and handover',
    '同一患者到达曲线下，比较固定班次与弹性排班的等待时间和工时利用率，并测量交接班时的任务信息丢失率。7 天 × 3 组方案。':
      'Under the same arrival curve, compares fixed and flexible shifts on waiting time and utilization, and measures task information lost at handover. 7 days × 3 plans.',
    '平均等待': 'Avg. wait',
    '21.6 分钟': '21.6 min',
    '固定班 27.9 分钟': 'fixed shift 27.9 min',
    '工时利用率': 'Utilization',
    '固定班 71.5%': 'fixed shift 71.5%',
    '交接信息丢失率': 'Handover information loss',
    '待降低': 'to reduce',
    '资源预约的公平性': 'Fairness of resource booking',
    '床位与设备的三种预约策略（先到先得、优先级、公平分配）在同一到达序列下对照，比较等待时间、资源利用率与分配公平性。':
      'Compares three booking policies for beds and equipment — first-come-first-served, priority, and fair allocation — under the same arrival sequence, on waiting time, utilization, and fairness.',
    '等待时间基尼系数': 'Wait-time Gini coefficient',
    '先到先得 0.38': 'FCFS 0.38',
    '资源利用率': 'Utilization',
    '先到先得 79.2%': 'FCFS 79.2%',
    '19.4 分钟': '19.4 min',
    '先到先得 24.7 分钟': 'FCFS 24.7 min',

    // 07 future
    '这是一个起点': 'This is a starting point',
    '目前跑通的是一条门诊链路，以及围绕它的任务、权限与证据。借助 TwinHospital2，接下来我们想继续推进几件更基础的事。':
      'What runs today is one outpatient chain, together with the tasks, permissions, and evidence around it. With TwinHospital2, we want to push a few more foundational questions next.',
    'HIS API 的开放程度': 'How open should the HIS API be',
    '不同开放粒度下 Agent 能否稳定协作：哪些业务必须留在界面里，哪些可以交给接口。':
      'At what granularity Agents can collaborate reliably — which work must stay in the UI, and which can move to an API.',
    '不是给 Agent 配一个账号去点界面，而是让 HIS 原生为 AI 设计接口、权限与审计。':
      'Not giving an Agent an account to click through screens, but designing interfaces, permissions, and audit into the HIS for AI from the start.',
    '当 AI 成为稳定的参与者，医院的组织、排班与流程可以据此重新设计。':
      'Once AI is a stable participant, hospital organization, staffing, and processes can be redesigned around it.',
    '患者纵向数据合成': 'Longitudinal synthetic patient data',
    '合成能通过真实数据检验的纵向患者数据，让仿真的分布与真实医院保持一致。':
      'Synthesize longitudinal patient data that survives validation against real data, so simulation matches real hospital distributions.',

    // boundary
    '研究原型，而非真实诊疗系统': 'A research prototype, not a clinical system',
    'TwinHospital2 使用合成数据，当前用于数字医院、GUI Agent 与可信工作流研究。部分业务已经形成真实 HIS 验收证据，其余能力仍按明确状态持续验证。':
      'TwinHospital2 uses synthetic data and is currently applied to digital-hospital, GUI Agent, and trustworthy-workflow research. Some workflows have real HIS acceptance evidence; the rest stays under explicit status verification.',

    // contact
    '联系与引用': 'Contact & citation',
    '从一次就诊，': 'From one visit',
    '到整座医院的协同': 'to hospital-wide coordination',
    '欢迎交流、合作与引用。': 'We welcome discussion, collaboration, and citation.',
    '如需复现实验、获取合成数据或讨论 HIS 侧的接入方式，请与我们联系。':
      'Reach out to reproduce the experiments, obtain synthetic data, or discuss HIS-side integration.',
    '引用': 'Citation',
    '复制': 'Copy',
    '已复制': 'Copied',
    '从个体诊疗到医院协同，让医院在数字世界中运行。':
      'From individual care to hospital-wide coordination — running hospitals in the digital world.',
  };

  const TITLE = { zh: 'TwinHospital2 · 运行在数字世界的 AI 医院', en: 'TwinHospital2 · Running hospitals in the digital world' };
  const DESC = {
    zh: 'TwinHospital2：让医院在数字世界中运行。一个连接医院空间、HIS 业务、AI Agent 与可信证据的数字医院研究原型。',
    en: 'TwinHospital2: running hospitals in the digital world. A digital-hospital research prototype connecting hospital space, HIS workflows, AI agents, and verifiable evidence.',
  };
  const STORE = 'th2-lang';
  const has = key => Object.prototype.hasOwnProperty.call(EN, key);
  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();
  let lang = 'zh';
  try { lang = localStorage.getItem(STORE) === 'en' ? 'en' : 'zh'; } catch (error) { /* storage unavailable */ }

  const translate = value => (lang === 'en' && has(value) ? EN[value] : value);
  const skipped = element => !!element.closest('[data-i18n-skip], script, style, pre, code');

  function applyText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: node => (node.parentElement && !skipped(node.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    let node;
    while ((node = walker.nextNode())) {
      if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
      const raw = textOriginals.get(node);
      const key = raw.trim();
      if (!key) continue;
      node.nodeValue = lang === 'en' ? raw.replace(key, translate(key)) : raw;
    }
  }

  function applyAttributes(root) {
    root.querySelectorAll('[aria-label],[alt],[title]').forEach(element => {
      if (element.closest('[data-i18n-skip]')) return;
      if (!attrOriginals.has(element)) attrOriginals.set(element, {});
      const store = attrOriginals.get(element);
      ['aria-label', 'alt', 'title'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        if (!(attribute in store)) store[attribute] = element.getAttribute(attribute);
        element.setAttribute(attribute, translate(store[attribute]));
      });
    });
  }

  function apply(next) {
    lang = next;
    try { localStorage.setItem(STORE, lang); } catch (error) { /* storage unavailable */ }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    applyText(document.body);
    applyAttributes(document.body);
    document.title = TITLE[lang];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', DESC[lang]);
    document.querySelectorAll('[data-set-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.setLang === lang)));
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  window.TH2i18n = { lang: () => lang, t: translate };
  document.querySelectorAll('[data-set-lang]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.setLang !== lang) apply(button.dataset.setLang);
  }));

  apply(lang);
  delete document.documentElement.dataset.i18nPending;
})();
