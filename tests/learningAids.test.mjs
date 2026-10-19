import test from "node:test";
import assert from "node:assert/strict";
import { topics } from "../src/data.js";
import { getFocusGroups } from "../src/focusMap.js";
import { getStudyGuide } from "../src/studyGuides.js";

const guides = topics.flatMap((topic) => getFocusGroups(topic.id).flatMap((group) => group.items.map((item) => getStudyGuide(group, item.id))));
const guide = (id) => guides.find((entry) => entry.id === id);

test("each of 254 original points has an explicitly illustrative scenario, mapping and association", () => {
  for (const entry of guides) {
    assert.ok(entry.learningAid, entry.id);
    assert.equal(entry.learningAid.kind, "illustrative", entry.id);
    assert.match(entry.learningAid.scene, /^假设：/, entry.id);
    for (const field of ["scene", "mapping", "association"]) assert.ok(entry.learningAid[field].length >= 16, `${entry.id}/${field}`);
    assert.ok(entry.quizzes.some((quiz) => quiz.kind === "application" && quiz.answer === entry.learningAid.mapping), entry.id);
  }
  assert.equal(guides.length, 254);
  assert.equal(new Set(guides.map((entry) => entry.learningAid.scene)).size, 254);
});

test("coding examples preserve initial categories, relationships, and central-theme integration", () => {
  const open = guide("item-05-2-1"), axial = guide("item-05-2-2"), core = guide("item-05-2-3");
  assert.match(open.learningAid.mapping, /初步概念/);
  assert.match(open.learningAid.association, /标签/);
  assert.match(axial.learningAid.mapping, /关系/);
  assert.match(core.learningAid.mapping, /核心主题/);
  assert.ok(open.extraExample, "keep the existing source-backed apprenticeship example");
  assert.notEqual(open.learningAid.scene, axial.learningAid.scene);
});

test("sampling analogies distinguish sampling within every stratum from selecting whole clusters", () => {
  const stratified = guide("item-08-4-4"), cluster = guide("item-08-4-5");
  assert.match(stratified.learningAid.scene, /每个年级/);
  assert.match(stratified.learningAid.mapping, /各层/);
  assert.match(cluster.learningAid.scene, /班/);
  assert.match(cluster.learningAid.mapping, /群/);
  assert.notEqual(stratified.learningAid.association, cluster.learningAid.association);
});

test("theory analogies and causal scenarios do not turn illustrative outcomes into proven facts", () => {
  assert.match(guide("item-02-0-0").learningAid.association, /航拍/);
  assert.match(guide("item-02-0-1").learningAid.association, /路网/);
  assert.match(guide("item-02-0-2").learningAid.association, /路口/);
  assert.match(guide("item-10-2-1").learningAid.mapping, /第三变量/);
  assert.match(guide("item-07-0-1").learningAid.scene, /是否/);
  for (const entry of guides) assert.doesNotMatch(entry.learningAid.scene, /研究证明|实验证明|数据显示|显著提升|提高了\d/);
});

test("paper-type example explains writing tasks rather than only repeating four labels", () => {
  const paper = guide("item-12-0-2");
  assert.match(paper.learningAid.mapping, /评述.*评价/);
  assert.match(paper.learningAid.mapping, /经验.*成败/);
  assert.match(paper.sourceNote, /14 研究生论文写作/);
});
