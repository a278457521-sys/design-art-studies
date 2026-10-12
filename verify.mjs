import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { branches, topics } from "./src/data.js";
import { detailGroupsById, totalDetailPoints } from "./src/details.js";
import { getFocusGroups } from "./src/focusMap.js";
import { getStudyGuide } from "./src/studyGuides.js";
import { pointCardsByTopic, totalMicroPoints } from "./src/pointCards.js";

const vault = "D:\\桌面\\设计学仓库\\设计艺术学研究";
const checkLocalNotes = !process.argv.includes("--portable");
const numbers = topics.map((topic) => topic.id);
const expected = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
let studyGuideCount = 0;
let microPointCount = 0;
if (branches.length !== 7) throw new Error(`Expected seven branches, got ${branches.length}`);
if (numbers.join(",") !== expected.join(",")) throw new Error(`Wrong topic order: ${numbers.join(",")}`);
for (const topic of topics) {
  if (!topic.keywords.length || !topic.route || !topic.tip || !topic.notes.length) throw new Error(`Incomplete topic ${topic.id}`);
  const groups = detailGroupsById[topic.id];
  if (!groups || groups.length < 4 || groups.reduce((sum, group) => sum + group.bullets.length, 0) < 12) throw new Error(`Insufficient detail for topic ${topic.id}`);
  for (const group of groups) {
    if (!group.title || !group.cue || !group.bullets.every(Boolean)) throw new Error(`Incomplete detail in topic ${topic.id}`);
  }
  const focusGroups = getFocusGroups(topic.id);
  if (pointCardsByTopic[topic.id]?.length !== focusGroups.length) throw new Error(`Point-card groups out of sync: ${topic.id}`);
  if (focusGroups.length !== groups.length || focusGroups.some((group, index) => group.items.length !== groups[index].bullets.length)) throw new Error(`Focus map loses detail points for ${topic.id}`);
  for (const group of focusGroups) {
    const groupIndex = focusGroups.indexOf(group);
    if (pointCardsByTopic[topic.id][groupIndex].length !== group.items.length) throw new Error(`Point-card items out of sync: ${group.id}`);
    for (const item of [null, ...group.items]) {
      const guide = getStudyGuide(group, item?.id);
      if (!guide.title || !guide.route || !guide.lead || !guide.summary || !guide.recall || !guide.cards.length || guide.cards.some((card) => !card.title || !card.text)) throw new Error(`Incomplete study guide: ${group.id}/${item?.id || "group"}`);
      if (item) {
        if (guide.kind !== "point" || guide.sourceText !== item.detail || !guide.hook || !guide.trap || guide.rounds.length !== 3 || guide.quizzes.length < 2) throw new Error(`Incomplete micro guide: ${item.id}`);
        microPointCount += guide.cards.length;
      }
      studyGuideCount++;
    }
  }
  for (const note of topic.notes) {
    if (checkLocalNotes && !existsSync(join(vault, note.path))) throw new Error(`Missing Obsidian note for ${topic.id}: ${note.path}`);
  }
}
if (totalDetailPoints < 200) throw new Error(`Expected at least 200 detail points, got ${totalDetailPoints}`);
if (microPointCount !== totalMicroPoints || microPointCount < 500) throw new Error(`Lost micro points: ${microPointCount}/${totalMicroPoints}`);
if (checkLocalNotes && !existsSync(join(vault, "设计艺术学/设计艺术学研究方法总复习导图.md"))) throw new Error("Missing detailed Obsidian source");
for (const asset of ["index.html", "app.js", "设计艺术学研究方法-交互导图.html"]) {
  if (!existsSync(join("dist", asset))) throw new Error(`Missing offline asset: ${asset}`);
}
const html = readFileSync(join("dist", "index.html"), "utf8");
const expectedScript = readFileSync(join("dist", "app.js"), "utf8").replaceAll("</script", "<\\/script");
const embeddedScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (embeddedScript !== expectedScript) throw new Error("Bundled script was altered while embedding into standalone HTML");
const documentMarkup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
if (/<(?:script|link|img|iframe|audio|video)\b[^>]*\b(?:src|href)\s*=\s*["']https?:\/\//i.test(documentMarkup)) throw new Error("Offline page references a remote resource");
if (/@import\s+["']?https?:\/\/|url\(\s*["']?https?:\/\//i.test(html)) throw new Error("Offline stylesheet references a remote resource");
if (!html.includes("<style>") || !html.includes("<script>")) throw new Error("Offline HTML does not embed its assets");
console.log(`Verified: seven branches, twelve ordered topics and focus maps, ${totalDetailPoints} reachable points, ${microPointCount} micro points, ${studyGuideCount} study-guide selections, ${checkLocalNotes ? "local note targets, " : ""}offline assets.`);
