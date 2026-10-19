import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { branches, topics, topicById, VAULT_NAME, CORE_NOTE, REVIEW_NOTE, EXAM_NOTE } from "./data.js";
import { detailGroupsById, totalDetailPoints } from "./details.js";
import { getFocusGroups, buildFocusLayout } from "./focusMap.js";
import { getStudyGuide } from "./studyGuides.js";
import { totalMicroPoints } from "./pointCards.js";

const PALETTES = {
  "原稿配色": ["#2B7AA6", "#3B817A", "#9A7131", "#87619D", "#4F719F", "#A26169", "#4E8C74"],
  Bauhaus: ["#D64045", "#1D3557", "#E9B44C", "#2D6A4F", "#7B2D8E", "#E07A5F", "#457B9D"],
  "Ocean Sunset": ["#E76F51", "#2A9D8F", "#E9C46A", "#264653", "#F4A261", "#287271", "#BC4749"],
  "Nordic Forest": ["#5B8C5A", "#4A6FA5", "#C17C74", "#7B6D8D", "#D4A574", "#4D8B8B", "#8B6F47"],
  "Pastel Garden": ["#7EB8DA", "#B5C99A", "#E8A87C", "#9B8EC1", "#F2CC8F", "#81B29A", "#E07A5F"],
};

const BRANCH_Y = [65, 160, 255, 395, 535, 625, 710];
const TOPIC_Y = {
  "01": 65, "02": 138, "03": 182, "04": 255,
  "05": 310, "06": 352, "07": 395, "08": 438, "09": 480,
  "10": 535, "11": 625, "12": 710,
};
const STORAGE_KEY = "design-methods-mindmap-progress-v1";
const ROOT_LABEL = "设计艺术学研究方法";

function getPill(label, depth) {
  const fs = depth === 0 ? 19 : depth === 1 ? 18 : 17;
  const pad = depth === 0 ? 26 : depth === 1 ? 22 : 19;
  const textWidth = Array.from(label).reduce((sum, ch) => sum + (/[^\u0000-\u00ff]/.test(ch) ? fs : fs * 0.61), 0);
  return { w: Math.max(textWidth + pad * 2, 100), h: depth === 0 ? 59 : depth === 1 ? 47 : 37 };
}

function edgePoint(cx, cy, hw, hh, tx, ty) {
  const dx = tx - cx, dy = ty - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.01) return { x: cx + hw, y: cy };
  const nx = dx / dist, ny = dy / dist;
  const t = 1.0 / Math.sqrt((nx * nx) / (hw * hw) + (ny * ny) / (hh * hh));
  return { x: cx + nx * t, y: cy + ny * t };
}

function buildCurve(a, b) {
  const pa = getPill(a.label, a.depth), pb = getPill(b.label, b.depth);
  const s = edgePoint(a.x, a.y, pa.w / 2, pa.h / 2, b.x, b.y);
  const e = edgePoint(b.x, b.y, pb.w / 2, pb.h / 2, a.x, a.y);
  const qx = (s.x + e.x) / 2 + (s.y - e.y) * 0.12;
  const qy = (s.y + e.y) / 2 + (e.x - s.x) * 0.12;
  return `M ${s.x} ${s.y} Q ${qx} ${qy} ${e.x} ${e.y}`;
}

function buildLayout(collapsed) {
  const root = { id: "root", label: ROOT_LABEL, depth: 0, x: 125, y: 395 };
  const nodes = [root], edges = [];
  branches.forEach((branch, branchIndex) => {
    const parent = { id: branch.id, label: branch.label, depth: 1, branchIndex, x: 345, y: BRANCH_Y[branchIndex] };
    nodes.push(parent);
    edges.push({ from: root, to: parent, branchIndex, depth: 1 });
    if (!collapsed.has(branch.id)) {
      branch.children.forEach((topic) => {
        const child = { id: topic.id, label: `${topic.id}  ${topic.label}`, depth: 2, branchIndex, x: 575, y: TOPIC_Y[topic.id] };
        nodes.push(child);
        edges.push({ from: parent, to: child, branchIndex, depth: 2 });
      });
    }
  });
  return { nodes, edges };
}

function noteUrl(note, vaultName) {
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(note.path)}`;
}

function toMarkmap() {
  const escape = (value) => String(value).replace(/([\\`*_\[\]])/g, "\\$1");
  const out = ["---", `title: ${JSON.stringify(ROOT_LABEL)}`, "markmap:", "  colorFreezeLevel: 2", "  maxWidth: 300", "---", "", `# ${ROOT_LABEL}`, ""];
  branches.forEach((branch) => {
    out.push(`## ${escape(branch.label)}`);
    branch.children.forEach((topic) => {
      out.push(`- **${topic.id}** ${escape(topic.fullTitle)}`);
      out.push(`  - ${escape(topic.keywords.join(" · "))}`);
      out.push(`  - 回忆路线：${escape(topic.route)}`);
      out.push(`  - 答题提醒：${escape(topic.tip)}`);
      detailGroupsById[topic.id].forEach((group, groupIndex) => {
        out.push(`  - **${escape(group.title)}**（${escape(group.cue)}）`);
        const focusGroup = getFocusGroups(topic.id)[groupIndex];
        group.bullets.forEach((bullet, itemIndex) => {
          const guide = getStudyGuide(focusGroup, focusGroup.items[itemIndex].id);
          out.push(`    - ${escape(bullet)}`, `      - 记忆抓手：${escape(guide.hook)}`);
          guide.cards.forEach((card) => out.push(`      - ${escape(card.title)}：${escape(card.text)}`));
          out.push(`      - 情境举例（辅助编写）：${escape(guide.learningAid.scene)}`, `      - 概念对应：${escape(guide.learningAid.mapping)}`, `      - 联想记忆：${escape(guide.learningAid.association)}`, `      - 应用自测：这个情境怎样体现“${escape(guide.title)}”？先口述，再核对概念对应。`);
          if (guide.extraExample) out.push(`      - 补充理解：${escape(guide.extraExample)}`);
          out.push(`      - 易错提醒：${escape(guide.trap)}`);
        });
      });
    });
    out.push("");
  });
  out.push("## 资料来源", "- 学习整理说明：细分解释、记忆抓手、易错提醒、举例和联想为学习辅助，非课件逐字引文；新情境均为假设，不代表真实项目或实验结果；联想不能代替定义。", "- 原 PDF：《设计艺术学研究方法》总背诵框架思维导图（阅读版）", `- Obsidian：${CORE_NOTE}`, `- Obsidian：${REVIEW_NOTE}`, `- Obsidian：${EXAM_NOTE}`, "");
  return out.join("\n");
}

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { studied: Array.isArray(saved.studied) ? saved.studied : [], palette: PALETTES[saved.palette] ? saved.palette : "原稿配色", vaultName: saved.vaultName || VAULT_NAME };
  } catch {
    return { studied: [], palette: "原稿配色", vaultName: VAULT_NAME };
  }
}

function StudyGuide({ guide }) {
  const [round, setRound] = useState(0);
  const number = (index) => ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"][index - 1] || index;
  return <section className="study-guide" aria-label="当前小标题背诵方法" aria-live="polite">
    <header className="study-guide-header">
      {guide.kind === "point" && <span className="micro-badge">小点专属 · {guide.cards.length} 个细分点</span>}
      <h2>{guide.title}</h2>
      {guide.kind === "point" ? <div className="micro-route" aria-label="细分背诵路线">{guide.cards.map((card, index) => <React.Fragment key={card.title}>{index > 0 && <span aria-hidden="true">→</span>}<b>{card.title}</b></React.Fragment>)}</div> : <p>{guide.route}</p>}
    </header>
    {guide.hook && <div className="micro-hook"><span>记忆抓手</span><strong>{guide.hook}</strong><small>口诀仅辅助记忆，作答要还原为完整解释。</small></div>}
    <div className="study-guide-lead"><h3>① {guide.leadLabel}</h3><p>{guide.lead}</p></div>
    <div className="study-guide-arrow" aria-hidden="true">↓</div>
    <div className="study-guide-grid">{guide.cards.map((card, index) => <article className={`study-guide-card ${card.selected ? "selected" : ""}`} key={card.title}>
      <h3>{number(index + 2)} {card.title}{card.selected && <span>当前小点</span>}</h3>
      {card.cue && <strong>{card.cue}</strong>}<p>{card.text}</p>
    </article>)}</div>
    {guide.learningAid && <aside className="micro-example" aria-label="对应举例与联想记忆">
      <h3>用例子理解，再联想记忆</h3>
      <div className="learning-aid-part"><span>01 · 情境举例</span><p>{guide.learningAid.scene}</p></div>
      <div className="learning-aid-part"><span>02 · 为什么对应这个知识点</span><p>{guide.learningAid.mapping}</p></div>
      <div className="learning-aid-part association"><span>03 · 联想记忆</span><p>{guide.learningAid.association}</p></div>
      <small>假设学习情境，不是真实研究结果。联想帮你提取要点，不能代替正式定义。</small>
      {guide.extraExample && <details className="extra-example"><summary>再看一个补充例子</summary><p>{guide.extraExample}</p></details>}
    </aside>}
    {guide.rounds && <div className="micro-rounds">
      <h3>三轮背法 · 按自己的熟练程度切换</h3>
      <div className="round-buttons" role="group" aria-label="选择背诵轮次">{guide.rounds.map((entry, index) => <button key={entry.title} aria-label={entry.title} aria-pressed={round === index} onClick={() => setRound(index)}>{["① 记骨架", "② 讲清楚", "③ 连成句"][index]}</button>)}</div>
      <p className="round-content">{guide.rounds[round].text}</p>
    </div>}
    <div className="study-guide-arrow" aria-hidden="true">↓</div>
    <div className="study-guide-summary"><h3>{number(guide.cards.length + 2)} {guide.kind === "point" ? "连成一段怎么说" : "总结"}</h3><p>{guide.summary}</p>{guide.kind === "point" && <small>复述参考句 · 依据资料整理，非逐字引文</small>}</div>
    {guide.trap && <aside className="micro-trap"><h3>容易背错的地方</h3><p>{guide.trap}</p></aside>}
    <div className="study-guide-recall"><span>怎么背</span><p>{guide.recall}</p></div>
    {guide.quizzes && <div className="micro-quizzes"><h3>闭卷自测 · 先答，再点开核对</h3>{guide.quizzes.map((quiz, index) => <details key={quiz.question}><summary><span>{index + 1}</span>{quiz.question}</summary><p>{quiz.answer}</p></details>)}</div>}
    {guide.sourceNote && <p className="micro-source">依据：{guide.sourceNote}。细分解释、口诀、提醒及复述句为学习整理；上方保留资料原句。</p>}
  </section>;
}

function App() {
  const stored = useMemo(readProgress, []);
  const [selectedId, setSelectedId] = useState("01");
  const [viewMode, setViewMode] = useState("overview");
  const [focusGroupId, setFocusGroupId] = useState(null);
  const [focusItemId, setFocusItemId] = useState(null);
  const [panelSelection, setPanelSelection] = useState(null);
  const [compactScreen, setCompactScreen] = useState(() => window.matchMedia("(max-width: 760px)").matches);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(new Set());
  const [studyMode, setStudyMode] = useState(false);
  const [revealed, setRevealed] = useState(new Set());
  const [studied, setStudied] = useState(new Set(stored.studied));
  const [palName, setPalName] = useState(stored.palette);
  const [vaultName, setVaultName] = useState(stored.vaultName);
  const [saveMsg, setSaveMsg] = useState("");
  const [search, setSearch] = useState("");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [openAllDetails, setOpenAllDetails] = useState(false);
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const searchRef = useRef(null);
  const detailPanelRef = useRef(null);

  const selected = topicById[selectedId];
  const colors = PALETTES[palName];
  const focusGroups = useMemo(() => getFocusGroups(selectedId), [selectedId]);
  const activeGroup = focusGroups.find((group) => group.id === focusGroupId);
  const activeItem = activeGroup?.items.find((item) => item.id === focusItemId);
  const panelGroup = focusGroups.find((group) => group.id === panelSelection?.groupId);
  const studyGuide = viewMode === "focus" ? getStudyGuide(panelGroup, panelSelection?.itemId) : null;
  const layout = useMemo(() => viewMode === "focus" ? buildFocusLayout(selectedId, focusGroupId) : buildLayout(collapsed), [viewMode, selectedId, focusGroupId, collapsed]);
  const canvasHeight = viewMode === "focus" ? Math.max(380, Math.max(...layout.nodes.map((node) => Math.abs(node.y - 380))) * 2 + 130) : 760;
  const canvasTop = 380 - canvasHeight / 2;
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return topics.filter((topic) => [topic.id, topic.label, topic.fullTitle, topic.branchLabel, topic.route, topic.tip, ...topic.keywords, ...detailGroupsById[topic.id].flatMap((group) => [group.title, group.cue, ...group.bullets])].join(" ").toLowerCase().includes(q));
  }, [search]);
  const visibleAnswer = !studyMode || revealed.has(selectedId);

  useLayoutEffect(() => {
    detailPanelRef.current?.scrollTo({ top: 0, behavior: "instant" });
    if (compactScreen && mobilePanelOpen) detailPanelRef.current?.focus({ preventScroll: true });
  }, [panelSelection, selectedId, compactScreen, mobilePanelOpen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = (event) => {
      setCompactScreen(event.matches);
      setMobilePanelOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!compactScreen || !mobilePanelOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [compactScreen, mobilePanelOpen]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setFullscreen(false);
        setMobilePanelOpen(false);
        setSearch("");
      }
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "ArrowRight" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        const index = topics.findIndex((topic) => topic.id === selectedId);
        selectTopic(topics[(index + 1) % topics.length].id);
      }
      if (event.key === "ArrowLeft" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        const index = topics.findIndex((topic) => topic.id === selectedId);
        selectTopic(topics[(index - 1 + topics.length) % topics.length].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, collapsed]);

  function selectTopic(id) {
    const topic = topicById[id];
    if (!topic) return;
    setSelectedId(id);
    setViewMode("focus");
    setMobilePanelOpen(false);
    const firstGroupId = getFocusGroups(id)[0]?.id || null;
    setFocusGroupId(firstGroupId);
    setPanelSelection({ groupId: firstGroupId, itemId: null });
    setFocusItemId(null);
    resetView();
    setOpenAllDetails(false);
    setCollapsed((current) => {
      if (!current.has(topic.branchId)) return current;
      const next = new Set(current);
      next.delete(topic.branchId);
      return next;
    });
    setSearch("");
  }

  function resetView() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  function returnToOverview() {
    setViewMode("overview");
    setMobilePanelOpen(false);
    setPanelSelection(null);
    setFocusItemId(null);
    resetView();
  }

  function openFocusGroup(groupId) {
    setViewMode("focus");
    setFocusGroupId(groupId);
    setFocusItemId(null);
    if (groupId) {
      setPanelSelection({ groupId, itemId: null });
      showSelectedGuide();
    }
    resetView();
  }

  function showSelectedGuide() {
    if (compactScreen) {
      setMobilePanelOpen(true);
      setFullscreen(false);
    }
  }

  function activateNode(node) {
    if (node.kind === "focus-root") return returnToOverview();
    if (node.kind === "group") {
      setPanelSelection({ groupId: node.id, itemId: null });
      showSelectedGuide();
      return openFocusGroup(node.expanded ? null : node.id);
    }
    if (node.kind === "item") {
      setPanelSelection({ groupId: focusGroupId, itemId: node.id });
      showSelectedGuide();
      return setFocusItemId(node.id);
    }
    if (node.depth === 0) {
      setCollapsed(new Set());
      resetView();
    } else if (node.depth === 1) toggleBranch(node.id);
    else selectTopic(node.id);
  }

  function toggleBranch(id) {
    setCollapsed((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleStudied(id) {
    setStudied((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ studied: [...studied], palette: palName, vaultName, updatedAt: new Date().toISOString() }));
      setSaveMsg("已保存 ✓");
    } catch {
      setSaveMsg("保存失败");
    }
    window.setTimeout(() => setSaveMsg(""), 2400);
  }

  function handleMarkmap() {
    const url = URL.createObjectURL(new Blob([toMarkmap()], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "设计艺术学研究方法-交互导图.markmap.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function zoom(delta) {
    setScale((current) => Math.min(2.3, Math.max(0.65, +(current + delta).toFixed(2))));
  }

  function onPointerDown(event) {
    if (event.target.closest?.(".map-node")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const screenUnit = Math.max(700 / rect.width, canvasHeight / rect.height);
    setOffset({ x: drag.ox + (event.clientX - drag.x) * screenUnit, y: drag.oy + (event.clientY - drag.y) * screenUnit });
  }

  function onPointerUp(event) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onWheel(event) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    zoom(event.deltaY < 0 ? 0.08 : -0.08);
  }

  return (
    <div className={`app ${fullscreen ? "is-fullscreen" : ""}`}>
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
        <div className="brand-copy"><div className="eyebrow">2027 · 688 设计理论（一）</div><h1>设计艺术学研究方法</h1><p>七段主线 · 十二专题 · {totalDetailPoints} 个小点 → {totalMicroPoints} 个背诵细点</p></div>
        <div className="topbar-right"><span className="source-badge">依据原 PDF 与 Obsidian 笔记</span><span className="progress-badge">已背 {studied.size} / 12</span></div>
      </header>

      <div className={`workspace ${studyGuide ? "has-study-guide" : ""}`}>
        <aside className="left-rail">
          <div className="rail-heading"><span>复习导航</span><small>01—12</small></div>
          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索考点、关键词  /" aria-label="搜索考点" />
            {search && <button onClick={() => setSearch("")} aria-label="清空搜索">×</button>}
          </div>
          {search.trim() ? (
            <div className="search-results">
              <p>{matches.length ? `找到 ${matches.length} 个考点` : "没有匹配的考点"}</p>
              {matches.map((topic) => <button key={topic.id} onClick={() => selectTopic(topic.id)}><b>{topic.id}</b><span>{topic.fullTitle}</span></button>)}
            </div>
          ) : (
            <nav aria-label="七段十二枝导航">
              {branches.map((branch, index) => (
                <div className="nav-group" key={branch.id}>
                  <div className="nav-group-title"><i style={{ background: colors[index] }}></i><span>{branch.label}</span><small>{branch.question}</small></div>
                  {branch.children.map((topic) => <button className={`nav-topic ${selectedId === topic.id ? "active" : ""}`} key={topic.id} onClick={() => selectTopic(topic.id)}><span className="nav-number">{topic.id}</span><span>{topic.label}</span>{studied.has(topic.id) && <span className="nav-done" aria-label="已背">✓</span>}</button>)}
                </div>
              ))}
            </nav>
          )}
          <div className="rail-foot"><span>背诵顺序</span><p>基础 → 理论文献 → 目标方案 → 资料与方法 → 分析验证 → 综合建构 → 成果输出</p></div>
        </aside>

        <main className="map-column">
          <div className="map-heading"><div><span className="section-kicker">{viewMode === "focus" ? `专题 / ${selected.id} ${selected.label}` : "总览 / 知识地图"}</span><h2>{viewMode === "focus" ? "沿分组展开，逐个回忆小点" : "先看树干，再沿枝条找考点"}</h2><p>{viewMode === "focus" ? "点击分组或小点，右侧同步切换对应的背诵方法。" : "点击彩色主枝可收起；点击编号考点进入专题导图。"}</p></div><button className="source-link" onClick={() => setShowSources(true)}>资料说明 ↗</button></div>
          <div className="map-toolbar">
            <div className="tool-cluster">{viewMode === "focus" && <button className="overview-button" onClick={returnToOverview}>← 总览</button>}<button onClick={resetView} title="适应画布">适应画布</button><button onClick={() => zoom(-0.12)} aria-label="缩小">－</button><span className="zoom-label">{Math.round(scale * 100)}%</span><button onClick={() => zoom(0.12)} aria-label="放大">＋</button></div>
            <div className="tool-cluster"><label className="palette-label">配色 <select value={palName} onChange={(event) => setPalName(event.target.value)}>{Object.keys(PALETTES).map((name) => <option key={name}>{name}</option>)}</select></label>{viewMode === "focus" ? <button onClick={() => openFocusGroup(focusGroupId ? null : focusGroups[0].id)}>{focusGroupId ? "收起小点" : "展开首组"}</button> : <button onClick={() => setCollapsed(new Set(collapsed.size === branches.length ? [] : branches.map((branch) => branch.id)))}>{collapsed.size === branches.length ? "全部展开" : "全部收起"}</button>}<button onClick={() => setFullscreen((current) => !current)}>{fullscreen ? "退出全屏" : "全屏"}</button></div>
          </div>
          {viewMode === "focus" && <div className="focus-breadcrumb"><button onClick={returnToOverview}>七段十二枝</button><span>›</span><strong>{selected.id} {selected.label}</strong>{activeGroup && <><span>›</span><span>{activeGroup.label}</span></>}<small>{focusGroups.length} 组 · {focusGroups.reduce((sum, group) => sum + group.items.length, 0)} 小点</small></div>}
          <div className={`map-stage ${viewMode === "focus" ? "focus-stage" : ""}`} ref={mapRef}>
            <svg className="mindmap" viewBox={`0 ${canvasTop} 700 ${canvasHeight}`} role="img" aria-label={viewMode === "focus" ? `${selected.id} ${selected.label}细分背诵思维导图` : "设计艺术学研究方法七段十二枝可点击思维导图"} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onWheel={onWheel}>
              <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.1" fill="#dbe4ec" /></pattern></defs>
              <rect x="0" y="0" width="700" height="760" fill="url(#dots)" />
              <g transform={`translate(${offset.x} ${offset.y}) translate(350 380) scale(${scale}) translate(-350 -380)`}>
                {layout.edges.map((edge, index) => <path key={`edge-${index}`} d={buildCurve(edge.from, edge.to)} fill="none" stroke={colors[edge.branchIndex]} strokeWidth={edge.depth === 1 ? 3 : 2.2} strokeOpacity={edge.depth === 1 ? 0.52 : 0.42} strokeLinecap="round" />)}
                {layout.nodes.map((node) => {
                  const displayLabel = node.kind === "item" && !visibleAnswer ? `小点 ${activeGroup.items.findIndex((item) => item.id === node.id) + 1}` : node.label;
                  const pill = getPill(node.label, node.depth);
                  const color = node.depth === 0 ? "#18344e" : colors[node.branchIndex];
                  const isSelected = node.id === selectedId || node.id === focusItemId || (node.kind === "group" && node.expanded);
                  const isBranch = node.depth === 1;
                  const isStudied = studied.has(node.id);
                  return <g key={node.id} className={`map-node ${node.depth === 2 ? "topic-node" : ""}`} transform={`translate(${node.x},${node.y})`} tabIndex={0} role="button" aria-label={node.kind === "focus-root" ? `${node.label}，返回总览` : node.depth === 0 ? "导图中心" : isBranch ? `${node.label}，点击收起或展开` : `${displayLabel}，点击查看${node.kind === "item" ? "背诵方法" : "考点"}`} aria-expanded={isBranch ? (node.kind === "group" ? node.expanded : !collapsed.has(node.id)) : undefined} onClick={() => activateNode(node)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activateNode(node); } }}>
                    {isSelected && <rect x={-pill.w / 2 - 5} y={-pill.h / 2 - 5} width={pill.w + 10} height={pill.h + 10} rx="17" fill="none" stroke={color} strokeWidth="2.5" />}
                    <rect x={-pill.w / 2} y={-pill.h / 2} width={pill.w} height={pill.h} rx={node.depth === 0 ? 19 : 15} fill={node.depth === 2 ? "#fff" : color} fillOpacity="1" stroke={node.depth === 2 ? "#d8e2ea" : "none"} strokeWidth="1.4" />
                    {node.depth === 2 && <rect x={-pill.w / 2} y={-pill.h / 2} width="7" height={pill.h} rx="3" fill={color} />}
                    <text textAnchor="middle" dominantBaseline="central" fontSize={node.depth === 0 ? 19 : node.depth === 1 ? 18 : 17} fontWeight={node.depth === 2 ? 650 : 750} fill={node.depth === 2 ? "#1d344b" : "#fff"} style={{ fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif', pointerEvents: "none" }}>{displayLabel}</text>
                    {isBranch && <text x={pill.w / 2 - 15} textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill="#fff" style={{ pointerEvents: "none" }}>{node.kind === "group" ? (node.expanded ? "−" : "+") : collapsed.has(node.id) ? "+" : "−"}</text>}
                    {isStudied && node.depth === 2 && <circle cx={pill.w / 2 - 3} cy={-pill.h / 2 + 3} r="11" fill="#2D7A63" stroke="#fff" strokeWidth="2" />}
                    {isStudied && node.depth === 2 && <text x={pill.w / 2 - 3} y={-pill.h / 2 + 3} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#fff" style={{ pointerEvents: "none" }}>✓</text>}
                  </g>;
                })}
              </g>
            </svg>
            <div className="map-hint">拖动画布 · Ctrl＋滚轮缩放 · {viewMode === "focus" ? "点击分组或小点" : "点击节点"}</div>
          </div>
          {viewMode === "focus" && !studyGuide && <section className={`focus-detail ${activeItem ? "has-selection" : ""}`} aria-live="polite" style={{ "--focus-color": colors[selected.branchIndex] }}>
            <div className="focus-detail-label"><span>{activeItem && visibleAnswer ? activeItem.label : activeGroup?.label || "选择一个分组"}</span><small>{activeItem ? "完整背诵句" : activeGroup?.cue || "从彩色节点开始"}</small></div>
            {activeItem ? (visibleAnswer ? <p>{activeItem.detail}</p> : <div className="focus-recall"><p>先口述这个小点，再揭示答案。</p><button onClick={() => setRevealed((current) => new Set([...current, selectedId]))}>揭示答案</button></div>) : <p>{activeGroup ? `已展开 ${activeGroup.items.length} 个小点，点击右侧白色节点查看说明。` : "点击任一彩色分组，展开它下面的背诵小点。"}</p>}
          </section>}
          <div className="map-footer"><span><b>方法关系</b> 定性 ↔ 定量 · 调查 ↔ 田野 · 相关 ↔ 实验 · 历史 ↔ 个案</span><span>每枝均为 ★★★ 考纲明确重点</span></div>
        </main>

        {compactScreen && mobilePanelOpen && <button className="mobile-panel-backdrop" aria-label="关闭背诵卡" onClick={() => setMobilePanelOpen(false)} />}
        <aside className={`detail-panel ${studyGuide ? "is-contextual" : ""} ${compactScreen && mobilePanelOpen ? "mobile-open" : ""}`} ref={detailPanelRef} role={compactScreen && mobilePanelOpen ? "dialog" : undefined} aria-modal={compactScreen && mobilePanelOpen ? true : undefined} aria-label="背诵方法面板" tabIndex={0}>
          {compactScreen && mobilePanelOpen && <div className="mobile-panel-bar"><button onClick={() => setMobilePanelOpen(false)}>← 返回导图</button><span>小标题背诵卡</span></div>}
          <div className="detail-top"><span className="detail-eyebrow">考点 {selected.id} / 12</span><span className="priority">★★★ 明确重点</span></div>
          {studyGuide ? <div className="context-navigation"><span>{selected.label} · 小标题背诵</span><button onClick={() => setPanelSelection(null)}>本章完整卡 ↗</button></div> : <><div className="detail-number" style={{ background: colors[selected.branchIndex] }}>{selected.id}</div><p className="detail-parent">{selected.branchLabel} · {branches[selected.branchIndex].question}</p><h2>{selected.fullTitle}</h2></>}
          <div className="detail-actions"><button className={`study-toggle ${studyMode ? "on" : ""}`} onClick={() => setStudyMode((current) => !current)} aria-pressed={studyMode}>{studyMode ? "退出背诵模式" : "进入背诵模式"}</button><button className={studied.has(selected.id) ? "done" : ""} onClick={() => toggleStudied(selected.id)}>{studied.has(selected.id) ? "✓ 已背" : "标记已背"}</button></div>
          {studyMode && !visibleAnswer ? <div className="answer-cover"><span>闭卷回忆</span><h3>{studyGuide ? `你能复述“${studyGuide.title}”的各项内容吗？` : "你能说出这枝的关键词和答题路线吗？"}</h3><p>先试着口述，再揭示答案。</p><button onClick={() => setRevealed((current) => new Set([...current, selected.id]))}>揭示答案</button></div> : studyGuide ? <StudyGuide key={studyGuide.id || panelGroup.id} guide={studyGuide} /> : <>
            <section className="detail-section"><div className="section-label">关键词</div><div className="keyword-list">{selected.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></section>
            <section className="detail-section"><div className="section-label">回忆路线</div><p className="route-text">{selected.route}</p></section>
            <section className="detail-section tip-section"><div className="section-label">答题提醒</div><p>{selected.tip}</p></section>
            {selected.compare && <section className="detail-section compare-section"><div className="section-label">易混辨析</div><p>{selected.compare}</p></section>}
            <section className="detail-section deep-section">
              <div className="deep-heading"><div><div className="section-label">细分背诵卡</div><p>{detailGroupsById[selected.id].length} 组 · {detailGroupsById[selected.id].reduce((sum, group) => sum + group.bullets.length, 0)} 条小点</p></div><button onClick={() => setOpenAllDetails((current) => !current)}>{openAllDetails ? "收起分组" : "展开全部"}</button></div>
              <div className="deep-list" key={`${selected.id}-${openAllDetails}`}>
                {detailGroupsById[selected.id].map((group, index) => <details key={group.title} open={openAllDetails || index === 0}>
                  <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{group.title}</strong><small>{group.cue}</small></summary>
                  <ul>{group.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                  <button className="show-in-map" onClick={() => openFocusGroup(focusGroups[index].id)}>在导图中展开 →</button>
                </details>)}
              </div>
            </section>
          </>}
          <section className="detail-section note-section"><div className="section-label">回查原笔记</div>{selected.notes.map((note) => <div className="note-item" key={`${selected.id}-${note.path}-${note.label}`}><a href={noteUrl(note, vaultName)} title={`在 Obsidian 打开：${note.path}`}>{note.label} <span>↗</span></a><small>{note.path}{note.heading ? ` · ${note.heading}` : ""}</small></div>)}<div className="note-item"><a href={noteUrl({ path: REVIEW_NOTE }, vaultName)}>总复习导图 · 细分条目 <span>↗</span></a><small>{REVIEW_NOTE}</small></div></section>
          <div className="detail-bottom"><button onClick={handleSave}>{saveMsg || "💾 保存进度"}</button><button onClick={handleMarkmap}>⬇ 导出 .md</button></div>
          <div className="detail-pagination"><button disabled={selected.id === "01"} onClick={() => selectTopic(String(Number(selected.id) - 1).padStart(2, "0"))}>← 上一枝</button><span>{selected.id} / 12</span><button disabled={selected.id === "12"} onClick={() => selectTopic(String(Number(selected.id) + 1).padStart(2, "0"))}>下一枝 →</button></div>
        </aside>
      </div>

      {showSources && <div className="modal-backdrop" onClick={() => setShowSources(false)}><div className="modal" role="dialog" aria-modal="true" aria-label="资料说明" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowSources(false)}>×</button><span className="section-kicker">资料说明</span><h2>这张图从哪里来</h2><p>主干、01—12 考点、回忆路线和答题提醒，依据原 5 页 PDF 整理。细分背诵卡依据 Obsidian《设计艺术学研究方法总复习导图》的各章内容提炼；下方提供章节笔记和总复习导图的原文入口。</p><p>“2025／2026 真题”仅沿用原资料的线索，不代表近年出题频率。具体学术表述仍以章节原文和教材为准。</p><div className="modal-note"><strong>Obsidian 仓库名称</strong><label>若你在 Obsidian 中给仓库起了别名，可以改这里：<input value={vaultName} onChange={(event) => setVaultName(event.target.value)} /></label><small>修改后点击“保存进度”，下次打开会保留。笔记链接需要本机安装 Obsidian。</small></div><button className="modal-primary" onClick={() => setShowSources(false)}>返回导图</button></div></div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
