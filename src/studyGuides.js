import { pointCardsByTopic } from "./pointCards.js";
import { learningAidsById } from "./learningAids.js";
import { getSourceCaseStudy } from "./sourceCases.js";

const sourceChapters = {
  "01": "01 研究方法导论", "02": "02 理论与研究", "03": "02 理论与研究 · 文献研究",
  "04": "02 理论与研究 · 研究设计", "05": "05 定性研究 / 06 定量研究",
  "06": "07 历史性研究", "07": "08 实验性研究", "08": "09 调查研究",
  "09": "10 田野考察法", "10": "11 相关性研究 / 12 逻辑论证法",
  "11": "13 个案与综合研究法", "12": "14 研究生论文写作",
};

export function getStudyGuide(group, itemId = null) {
  if (!group) return null;
  const item = group.items.find((entry) => entry.id === itemId);
  if (itemId && !item) throw new Error(`Unknown study-guide selection: ${itemId}`);
  if (item) {
    const [, topicId, groupIndex, itemIndex] = item.id.split("-");
    const point = pointCardsByTopic[topicId]?.[Number(groupIndex)]?.[Number(itemIndex)];
    if (!point) throw new Error(`Missing point breakdown: ${item.id}`);
    const { cards, hook, trap, example: extraExample } = point;
    const learningAid = learningAidsById[item.id];
    if (!learningAid) throw new Error(`Missing learning aid: ${item.id}`);
    const example = `情境举例：${learningAid.scene}\n概念对应：${learningAid.mapping}\n联想记忆：${learningAid.association}`;
    const route = cards.map((card) => card.title).join(" → ");
    const paragraph = cards.map((card) => card.text).join("");
    const summary = paragraph.startsWith(item.label) ? paragraph : `${item.label}：${paragraph}`;
    return {
      kind: "point", id: item.id, title: item.label, route, hook, cards, trap, example, extraExample, learningAid,
      caseStudy: getSourceCaseStudy(item.id),
      leadLabel: "资料原句", lead: item.detail, sourceText: item.detail,
      sourceNote: `《设计艺术学研究方法总复习导图》 · ${sourceChapters[topicId]}${topicId === "05" && Number(groupIndex) <= 3 ? "；补查《05 定性研究》章节笔记" : ""}${item.id === "item-12-0-2" ? "；类型辨析补查《14 研究生论文写作》章节笔记" : ""}`,
      summary,
      recall: `用“${hook}”提取要点，再把“${route}”各讲一句；最后不看提示完整复述。`,
      rounds: [
        { title: "第一轮 · 记骨架", text: `先记 ${cards.length} 个细点：${route}。联想提取：${learningAid.association}。再用“${hook}”还原要点。` },
        { title: "第二轮 · 讲清楚", text: `用上面的情境解释“${item.label}”：${learningAid.mapping} 再逐点说明“${cards.map((card) => card.title).join("”“")}”。特别注意：${trap}` },
        { title: "第三轮 · 连成答题句", text: `给自己30秒，不看提示，把“${item.label}”的 ${cards.length} 个细点连成正式答题句。再用应用自测检验理解；例子和联想不能代替定义。` },
      ],
      quizzes: [
        { kind: "application", question: `应用自测：上面的情境怎样体现“${item.label}”？`, answer: learningAid.mapping },
        ...cards.map((card) => ({ question: `“${item.label}”中的“${card.title}”要说明什么？`, answer: card.text })),
        { question: `复述“${item.label}”时，应避免什么混淆或遗漏？`, answer: trap },
      ],
    };
  }
  const labels = group.items.map((entry) => entry.label);
  return {
    kind: "group", title: group.label,
    route: group.cue,
    leadLabel: "背诵抓手",
    lead: `先记“${group.cue}”，再依次复述下面 ${group.items.length} 个小点。点击导图的小点可查看专属细分解释。`,
    cards: group.items.map((entry) => ({
      title: entry.label,
      text: entry.detail,
    })),
    summary: `按顺序串起：${labels.join(" → ")}。`,
    recall: `闭卷自测：能否说全 ${group.items.length} 个小点，并逐个解释？`,
  };
}
