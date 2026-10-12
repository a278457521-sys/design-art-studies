export const VAULT_NAME = "设计艺术学研究";
export const CORE_NOTE = "设计艺术学/00 设计艺术学研究方法总背诵框架.md";
export const REVIEW_NOTE = "设计艺术学/设计艺术学研究方法总复习导图.md";
export const EXAM_NOTE = "设计艺术学/00 湖北工业大学688设计理论（一）2027考纲.md";

export const branches = [
  {
    id: "foundation",
    label: "研究基础",
    question: "研究什么",
    children: [
      {
        id: "01", label: "研究基础", fullTitle: "设计艺术学研究基础",
        keywords: ["范畴", "内涵", "特征与难点", "方法体系", "研究过程"],
        route: "范畴 → 内涵 → 特征与难点 → 方法体系 → 研究过程",
        tip: "题干问“是什么”先给定义；问“特征”再列特点，别把研究范畴写成研究方法。",
        notes: [
          { label: "01 研究方法导论", path: "设计艺术学/章节笔记/01 研究方法导论.md" },
          { label: "总背诵框架 01", path: CORE_NOTE, heading: "01 ★★★ 设计艺术学研究基础" },
        ],
      },
    ],
  },
  {
    id: "theory",
    label: "理论文献",
    question: "从哪里立论",
    children: [
      {
        id: "02", label: "理论与研究", fullTitle: "理论的结构、层次与研究关系",
        keywords: ["理论结构", "宏观／中层／微观", "理论与研究的往返"],
        route: "理论结构 → 宏观／中层／微观三个层次 → 理论与研究的往返",
        tip: "“结构”和“层次”分开回忆；原资料标注 2025 真题涉及三个层次。",
        notes: [
          { label: "02 理论与研究", path: "设计艺术学/章节笔记/02 理论与研究.md" },
          { label: "总背诵框架 02", path: CORE_NOTE, heading: "02 ★★★ 理论的结构、层次及其与研究的关系" },
        ],
      },
      {
        id: "03", label: "设计文献", fullTitle: "文献查阅、阅读与研究关联",
        keywords: ["为什么查", "怎样查", "怎样读", "选题与后续研究"],
        route: "为什么查 → 怎样查 → 怎样读 → 选题和后续研究怎样用",
        tip: "问“作用”答文献回顾的作用；问“查阅方式”答具体操作。",
        notes: [
          { label: "02 理论与研究", path: "设计艺术学/章节笔记/02 理论与研究.md" },
          { label: "总背诵框架 03", path: CORE_NOTE, heading: "03 ★★★ 设计文献的查阅、阅读与研究关联" },
        ],
      },
    ],
  },
  {
    id: "plan",
    label: "目标方案",
    question: "怎么安排",
    children: [
      {
        id: "04", label: "研究设计", fullTitle: "研究目标、方式与方案",
        keywords: ["目标类型", "研究性质／方式", "选择方法", "书面方案"],
        route: "目标类型 → 研究性质／方式 → 选方法 → 写方案",
        tip: "方案五格：据、文、内、方、进。目标、性质、方案不可混作一个定义。",
        notes: [
          { label: "02 理论与研究", path: "设计艺术学/章节笔记/02 理论与研究.md" },
          { label: "总背诵框架 04", path: CORE_NOTE, heading: "04 ★★★ 研究目标、研究方式与方案制订" },
        ],
      },
    ],
  },
  {
    id: "methods",
    label: "资料与方法",
    question: "怎样取证",
    children: [
      {
        id: "05", label: "定性与定量", fullTitle: "定性、定量与变量关系",
        keywords: ["定性范式", "定量测量", "资料处理", "变量联系"],
        route: "定性看意义与过程；定量做编码、测量与统计 → 分析变量联系",
        tip: "先判断题目问范式、资料处理还是变量关系；原资料标注 2026 真题涉及定性策略。",
        notes: [
          { label: "05 定性研究", path: "设计艺术学/章节笔记/05 定性研究.md" },
          { label: "06 定量研究", path: "设计艺术学/章节笔记/06 定量研究.md" },
          { label: "11 相关性研究", path: "设计艺术学/章节笔记/11 相关性研究.md" },
        ],
        compare: "定性重意义、过程和语境；定量重测量、分布与数量关系。两者可以互补。",
      },
      {
        id: "06", label: "历史性研究", fullTitle: "历史性研究",
        keywords: ["课题类型", "文献与实物", "考证互证", "历史阐释"],
        route: "课题类型 → 文献、实物等史料 → 考证互证 → 历史阐释",
        tip: "材料题要指出证据之间如何互证，别只罗列文献与实物。",
        notes: [
          { label: "07 历史性研究", path: "设计艺术学/章节笔记/07 历史性研究.md" },
          { label: "总背诵框架 06", path: CORE_NOTE, heading: "06 ★★★ 历史性研究" },
        ],
      },
      {
        id: "07", label: "实验性研究", fullTitle: "实验性研究",
        keywords: ["假设", "自变量／因变量", "控制", "实验程序与类型"],
        route: "假设 → 自变量／因变量／控制 → 实验程序与类型 → 结果解释",
        tip: "注意实验室与实地实验的区别；相关关系不能直接写成因果。",
        notes: [
          { label: "08 实验性研究法", path: "设计艺术学/章节笔记/08 实验性研究法.md" },
          { label: "总背诵框架 07", path: CORE_NOTE, heading: "07 ★★★ 实验性研究" },
        ],
        compare: "相关研究观察变量联系；实验研究通过操纵和控制检验因果。",
      },
      {
        id: "08", label: "调查研究", fullTitle: "调查研究",
        keywords: ["调查类型", "过程", "抽样", "问卷", "分析报告"],
        route: "调查类型 → 过程 → 抽样 → 问卷 → 分析与报告",
        tip: "抽样回答“问谁”；问卷回答“问什么、怎样问”。",
        notes: [
          { label: "09 调查研究", path: "设计艺术学/章节笔记/09 调查研究.md" },
          { label: "总背诵框架 08", path: CORE_NOTE, heading: "08 ★★★ 调查研究" },
        ],
        compare: "调查偏广泛询问和抽样；田野偏进入现场、持续观察与理解。",
      },
      {
        id: "09", label: "田野考察", fullTitle: "田野考察",
        keywords: ["基本观点", "对象结构", "进场与整理", "观察访谈"],
        route: "基本观点 → 对象结构 → 进场、考察、整理 → 观察与访谈等方法",
        tip: "把“基本观点”和“基本方法”分开；原资料标注 2026 真题涉及田野方法。",
        notes: [
          { label: "10 田野考察法", path: "设计艺术学/章节笔记/10 田野考察法.md" },
          { label: "总背诵框架 09", path: CORE_NOTE, heading: "09 ★★★ 田野考察" },
        ],
        compare: "调查偏广泛询问和抽样；田野偏进入现场、持续观察与理解。",
      },
    ],
  },
  {
    id: "analysis",
    label: "分析验证",
    question: "证据说明什么",
    children: [
      {
        id: "10", label: "相关与逻辑", fullTitle: "相关性研究与逻辑论证",
        keywords: ["变量联系", "逻辑推理", "证据验证", "系统建构"],
        route: "相关：找变量联系 → 逻辑：推理、验证 → 建立有根据的解释",
        tip: "相关与实验区分“联系”和“因果检验”；原资料标注 2026 真题涉及两种逻辑。",
        notes: [
          { label: "11 相关性研究", path: "设计艺术学/章节笔记/11 相关性研究.md" },
          { label: "12 逻辑论证法", path: "设计艺术学/章节笔记/12 逻辑论证法.md" },
        ],
        compare: "相关性只能说明联系；因果判断还需更严格的证据。逻辑论证贯穿研究全过程。",
      },
    ],
  },
  {
    id: "synthesis",
    label: "综合建构",
    question: "如何形成认识",
    children: [
      {
        id: "11", label: "个案与综合", fullTitle: "个案研究与综合研究",
        keywords: ["确定个案", "深描资料", "多案例／多方法整合", "建构解释"],
        route: "确定个案 → 深描资料 → 多案例／多方法整合 → 建构解释",
        tip: "个案是对象集中，不表示只能用一种证据。",
        notes: [
          { label: "13 个案与综合研究法", path: "设计艺术学/章节笔记/13 个案与综合研究法.md" },
          { label: "总背诵框架 11", path: CORE_NOTE, heading: "11 ★★★ 个案研究与综合研究" },
        ],
      },
    ],
  },
  {
    id: "output",
    label: "成果输出",
    question: "如何清楚表达",
    children: [
      {
        id: "12", label: "论文与报告", fullTitle: "研究论文、报告与方法融合",
        keywords: ["成果类型", "写作结构", "证据与方法", "规范检查"],
        route: "确定成果类型 → 安排结构 → 用证据和方法支撑论证 → 检查规范",
        tip: "结论回扣研究问题，不能只复述前文或堆方法名称。",
        notes: [
          { label: "14 研究生论文写作", path: "设计艺术学/章节笔记/14 研究生论文写作.md" },
          { label: "总背诵框架 12", path: CORE_NOTE, heading: "12 ★★★ 研究论文、报告与方法融合" },
        ],
      },
    ],
  },
];

export const topics = branches.flatMap((branch, branchIndex) =>
  branch.children.map((topic) => ({ ...topic, branchId: branch.id, branchLabel: branch.label, branchIndex }))
);

export const topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));

export const connections = [
  { from: "05", to: "10", label: "变量关系" },
  { from: "07", to: "10", label: "因果辨析" },
  { from: "08", to: "09", label: "调查与田野" },
  { from: "06", to: "11", label: "历史与个案" },
];
