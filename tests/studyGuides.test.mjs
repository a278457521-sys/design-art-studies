import test from "node:test";
import assert from "node:assert/strict";
import { topics } from "../src/data.js";
import { getFocusGroups } from "../src/focusMap.js";
import { getStudyGuide } from "../src/studyGuides.js";

function point(topic, group, item) {
  const selected = getFocusGroups(topic)[group];
  return getStudyGuide(selected, selected.items[item].id);
}

test("all 254 leaf guides split the selected point rather than repeat sibling cards", () => {
  let count = 0;
  for (const topic of topics) for (const group of getFocusGroups(topic.id)) for (const item of group.items) {
    const guide = getStudyGuide(group, item.id);
    assert.equal(guide.kind, "point", item.id);
    assert.equal(guide.sourceText, item.detail, item.id);
    assert.ok(guide.cards.length >= 2 && guide.cards.length <= 8, item.id);
    assert.notDeepEqual(guide.cards.map((card) => card.title), group.items.map((sibling) => sibling.label), item.id);
    assert.ok(guide.cards.every((card) => card.title && card.text.length >= 8), item.id);
    assert.equal(guide.rounds.length, 3, item.id);
    assert.ok(guide.hook && guide.trap && guide.quizzes.length >= 2 && guide.sourceNote, item.id);
    assert.equal(new Set(guide.cards.map((card) => card.title)).size, guide.cards.length, item.id);
    count++;
  }
  assert.equal(count, 254);
});

test("three theory levels have their own scope, abstraction, and verification guidance", () => {
  const macro = point("02", 0, 0), middle = point("02", 0, 1), micro = point("02", 0, 2);
  assert.match(macro.cards.map((card) => card.text).join(""), /范围广/);
  assert.match(macro.summary, /造物论/);
  assert.match(middle.summary, /感性工学/);
  assert.match(micro.trap, /部分/);
  assert.notEqual(macro.hook, middle.hook);
});

test("three coding stages teach distinct operations and source-backed relationships", () => {
  const open = point("05", 2, 1), axial = point("05", 2, 2), core = point("05", 2, 3);
  assert.deepEqual(open.cards.map((card) => card.title), ["拆原始资料", "标记与命名", "归入初步类别", "保留调整空间"]);
  assert.match(open.summary, /初步概念/);
  for (const relation of ["时间", "因果", "功能", "语义"]) assert.ok(axial.summary.includes(relation));
  assert.match(core.summary, /核心主题/);
  assert.match(open.sourceNote, /05 定性研究/);
  assert.ok(open.example);
});

test("sampling and causal inference preserve the crucial exam distinctions", () => {
  const stratified = point("08", 4, 4), cluster = point("08", 4, 5);
  assert.match(stratified.trap, /层/);
  assert.match(cluster.trap, /群/);
  const causality = point("10", 2, 1);
  assert.match(causality.summary, /原因.*在先/);
  assert.match(causality.summary, /第三变量/);
  const inference = point("10", 5, 3);
  assert.match(inference.trap, /前提/);
  assert.match(inference.summary, /特殊.*一般/);
});

test("group overview remains a group guide and invalid selections fail explicitly", () => {
  const group = getFocusGroups("02")[0];
  assert.equal(getStudyGuide(group).cards.length, 3);
  assert.equal(getStudyGuide(null), null);
  assert.throws(() => getStudyGuide(group, "item-not-present"), /Unknown/);
});
