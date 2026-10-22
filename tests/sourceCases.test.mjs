import test from 'node:test';
import assert from 'node:assert/strict';
import { getFocusGroups } from '../src/focusMap.js';
import { caseSources, sourceCaseStudiesById, getSourceCaseStudy } from '../src/sourceCases.js';

const ids = [
  ...[0,1,2].map(i => `item-02-0-${i}`),
  ...[0,1,2,3].map(i => `item-05-2-${i}`),
  ...[0,1,2,3].map(i => `item-10-2-${i}`),
  ...[0,1,2].map(i => `item-11-0-${i}`),
  ...[0,1,2].map(i => `item-11-1-${i}`),
  ...[0,1,2].map(i => `item-11-5-${i}`),
  ...[0,1,2].map(i => `item-09-2-${i}`),
  ...[0,1,2,3].map(i => `item-07-2-${i}`),
];

test('27 first-batch source examples map to existing leaves and have independent recall explanations', () => {
  assert.deepEqual(Object.keys(sourceCaseStudiesById).sort(), ids.sort());
  const recalls = new Set();
  for (const id of ids) {
    const study = getSourceCaseStudy(id);
    const topicId = id.split('-')[1];
    assert.ok(getFocusGroups(topicId).some(g => g.items.some(item => item.id === id)), id);
    assert.ok(study.title.length >= 6, `${id}/title`);
    for (const key of ['summary','recall','analysis','association','boundary']) assert.ok(study[key].length >= 12, `${id}/${key}`);
    assert.ok(study.recall.length >= 65, `${id}/recall depth`);
    assert.ok(study.steps.length >= 3, `${id}/steps`);
    assert.ok(study.steps.every(s => s.title && s.text.length >= 30), `${id}/step depth`);
    assert.match(study.analysis, /演示|推演/);
    assert.ok(study.quizzes.length >= 2 && study.quizzes.every(q => q.question && q.answer.length >= 12));
    assert.ok(study.source.label.includes('万能热点案例库'));
    assert.ok(study.source.facts && study.source.status && study.source.scope);
    recalls.add(study.recall);
    assert.doesNotMatch(JSON.stringify(study), /C:[\\/]|D:[\\/]|wxid_|msg[\\/]file|研究证明|实验证明|显著提升|受访者说/);
  }
  assert.equal(recalls.size, ids.length);
  assert.equal(getSourceCaseStudy('item-01-0-0'), null);
});

test('sources expose verification limits rather than claiming every library statement is verified', () => {
  for (const source of Object.values(caseSources)) {
    assert.ok(source.label && source.facts.length >= 45 && source.scope.length >= 30);
    assert.ok(source.status);
    assert.ok(source.links.every(link => /^https:\/\//.test(link.url) && link.label));
  }
  assert.match(caseSources.minzhu.scope, /规划师.*建筑师.*工程师/);
  assert.match(caseSources.texture.scope, /未|不/);
});

test('method explanations preserve distinctions in theory, coding, correlation and synthesis', () => {
  assert.match(getSourceCaseStudy('item-02-0-0').boundary, /规模|大小/);
  assert.match(getSourceCaseStudy('item-05-2-1').recall, /初步概念/);
  assert.match(getSourceCaseStudy('item-05-2-2').recall, /关系/);
  assert.match(getSourceCaseStudy('item-05-2-3').recall, /核心/);
  assert.match(getSourceCaseStudy('item-10-2-1').boundary, /第三变量|混杂/);
  assert.match(getSourceCaseStudy('item-11-5-0').boundary, /多.*方法|方法.*多/);
  assert.match(getSourceCaseStudy('item-11-5-1').boundary, /跨学科|混合/);
  assert.match(getSourceCaseStudy('item-07-2-3').boundary, /随机|抽样/);
});
