// 分组与原有背诵卡共用正文；学习顺序、自测提示属于复习整理。
// 定性资料收集的展开解释依据 Obsidian《05 定性研究》“定性资料收集与编码”。
const collectionGuide = {
  title: "定性资料的收集",
  route: "定义 → 来源 → 作用",
  leadLabel: "定义",
  lead: "访谈记录、观察文字、速记符号、图片、录音录像，以及文献资源和相关实物。",
  cards: [
    { title: "实地访谈", cue: "交互式交流", text: "通过交流获取资料。" },
    { title: "观察所得", cue: "两种观察", text: "参与型、非参与型。" },
    { title: "文献资源", cue: "查阅与释解", text: "关键词、标题、作者。" },
    { title: "实物器具", cue: "物质资料", text: "历史文物、民间器具与玩具等实物。" },
  ],
  summary: "丰富资料、深入认识，为后续研究提供依据。",
  recall: "先说定义，再背“访—观—文—物”，最后说明资料的作用。",
};

export function getStudyGuide(group, itemId = null) {
  if (!group) return null;
  const item = group.items.find((entry) => entry.id === itemId);
  if (item?.id === "item-05-2-0") return collectionGuide;
  const labels = group.items.map((entry) => entry.label);
  return {
    title: item?.label || group.label,
    route: group.cue,
    leadLabel: item ? "核心背诵句" : "背诵抓手",
    lead: item?.detail || `先记“${group.cue}”，再依次复述下面 ${group.items.length} 个小点。`,
    cards: group.items.map((entry) => ({
      title: entry.label,
      text: entry.detail,
      selected: entry.id === itemId,
    })),
    summary: item ? `先解释“${item.label}”，再补充原句中的条件、作用或例子。` : `按顺序串起：${labels.join(" → ")}。`,
    recall: item ? "遮住答案，用自己的话复述核心句，再对照资料检查遗漏。" : `闭卷自测：能否说全 ${group.items.length} 个小点，并逐个解释？`,
  };
}
