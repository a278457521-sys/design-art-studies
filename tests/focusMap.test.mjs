import test from "node:test";
import assert from "node:assert/strict";
import { topics } from "../src/data.js";
import { detailGroupsById } from "../src/details.js";
import { getFocusGroups, buildFocusLayout } from "../src/focusMap.js";

test("every memorization point is reachable from its topic focus map", () => {
  for (const topic of topics) {
    const groups = getFocusGroups(topic.id);
    assert.equal(groups.length, detailGroupsById[topic.id].length, topic.id);
    groups.forEach((group, groupIndex) => {
      assert.equal(group.items.length, detailGroupsById[topic.id][groupIndex].bullets.length);
      group.items.forEach((item, itemIndex) => {
        assert.equal(item.detail, detailGroupsById[topic.id][groupIndex].bullets[itemIndex]);
        assert.ok(item.label.length > 0 && item.label.length <= 16, `${topic.id} ${item.label}`);
      });
    });
  }
});

test("theory's three levels are visible as direct focus-map leaves", () => {
  const groups = getFocusGroups("02");
  assert.equal(groups[0].label, "理论三层次");
  assert.deepEqual(groups[0].items.map((item) => item.label), ["宏观理论", "中层理论", "微观理论"]);
  assert.match(groups[0].items[0].detail, /全局视角/);
});

test("focus layout keeps groups and expanded leaves in separate readable columns", () => {
  for (const topic of topics) {
    const groups = getFocusGroups(topic.id);
    for (const group of groups) {
      const layout = buildFocusLayout(topic.id, group.id);
      const roots = layout.nodes.filter((node) => node.kind === "focus-root");
      const categories = layout.nodes.filter((node) => node.kind === "group");
      const leaves = layout.nodes.filter((node) => node.kind === "item");
      assert.equal(roots.length, 1);
      assert.equal(categories.length, groups.length);
      assert.equal(leaves.length, group.items.length);
      assert.equal(layout.edges.length, categories.length + leaves.length);
      assert.ok(roots[0].x < categories[0].x && categories[0].x < leaves[0].x);
      for (const column of [categories, leaves]) {
        const sorted = [...column].sort((a, b) => a.y - b.y);
        for (const node of sorted) assert.ok(node.y >= 24 && node.y <= 736, `${topic.id} ${node.id} at ${node.y}`);
        for (let index = 1; index < sorted.length; index++) assert.ok(sorted[index].y - sorted[index - 1].y >= 38, `${topic.id} ${sorted[index].id} overlaps`);
      }
    }
  }
});
