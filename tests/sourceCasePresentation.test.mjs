import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const fixture = { title:'案例 <script> & 标题', summary:'一句对应', recall:'复述', source:{label:'资料出处',facts:'事实 <b>原文</b>',status:'待核验',scope:'有限范围',links:[{label:'来源 [甲]',url:'https://example.com/a_(b)?x=1&y=2'}]},steps:[{title:'步骤 *甲*',text:'说明 [乙]'}],analysis:'教学推演内容',association:'联想内容',boundary:'边界内容',quizzes:[{question:'问题？',answer:'独立答案'}] };
test('case component exists and renders separated, escaped, default-closed content', async () => {
  assert.ok(existsSync(new URL('../src/SourceCaseStudy.jsx', import.meta.url)), 'case component is missing');
  const bundle = await build({stdin:{contents:'export { default } from "./src/SourceCaseStudy.jsx"',resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-dom/server']});
  const mod={exports:{}}; new Function('require','module','exports',bundle.outputFiles[0].text)(require,mod,mod.exports);
  const React=require('react'); const {renderToStaticMarkup}=require('react-dom/server');
  const html=renderToStaticMarkup(React.createElement(mod.exports.default,{study:fixture}));
  for(const label of ['资料记载','核验状态','逐点讲解','教学推演','联想记忆','适用边界','来源','30秒复述']) assert.ok(html.includes(label),label);
  assert.ok(html.includes('&lt;script&gt;')); assert.ok(!html.includes('<script>'));
  assert.equal((html.match(/<details/g)||[]).length,2); assert.ok(!/<details[^>]*\bopen/.test(html));
  assert.ok(!/<summary[^>]*>[^]*?独立答案[^]*?<\/summary>/.test(html));
  assert.ok(html.includes('rel="noopener noreferrer"')); assert.ok(!html.includes(' id='));
  const visibleHeader=html.slice(0,html.indexOf('<details'));
  assert.ok(visibleHeader.includes(fixture.source.label));assert.ok(visibleHeader.includes(fixture.source.status));
  assert.ok(!visibleHeader.includes(fixture.source.scope));assert.ok(!visibleHeader.includes('事实 &lt;b&gt;'));
  const noLinks=renderToStaticMarkup(React.createElement(mod.exports.default,{study:{...fixture,source:{...fixture.source,links:[]}}}));
  assert.ok(noLinks.includes('来源为上方案例库条目，尚无独立核验的公开一手链接。'));assert.ok(!noLinks.includes('<ul></ul>'));
  assert.equal(renderToStaticMarkup(React.createElement(mod.exports.default,{study:null})), '');
});
test('markdown preserves each field, safely escapes text and includes quiz answers',async()=>{
  assert.ok(existsSync(new URL('../src/sourceCaseMarkdown.js',import.meta.url)), 'markdown exporter is missing');
  const {sourceCaseToMarkdown}=await import('../src/sourceCaseMarkdown.js');
  assert.deepEqual(sourceCaseToMarkdown(null),[]);
  const text=sourceCaseToMarkdown(fixture).join('\n');
  for(const value of ['一句对应','复述','资料出处','事实','待核验','有限范围','教学推演内容','联想内容','边界内容','问题？','独立答案']) assert.ok(text.includes(value),value);
  assert.ok(text.includes('步骤 \\*甲\\*')); assert.ok(text.includes('说明 \\[乙\\]')); assert.ok(!text.includes('<script>'));
  assert.ok(text.includes('https://example.com/a_%28b%29?x=1&y=2'));
});
test('point guides expose matching case and null for unenhanced point',async()=>{
  const {getStudyGuide}=await import('../src/studyGuides.js'); const {getFocusGroups}=await import('../src/focusMap.js');
  const guides=Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')).flatMap(id=>getFocusGroups(id).flatMap(group=>group.items.map(item=>getStudyGuide(group,item.id))));
  assert.ok(guides.some(guide=>guide.caseStudy)); assert.ok(guides.some(guide=>guide.caseStudy===null));
  const {getSourceCaseStudy}=await import('../src/sourceCases.js');
  for(const guide of guides) assert.deepEqual(guide.caseStudy,getSourceCaseStudy(guide.id));
});
test('study panel places source cases before closed hypothetical practice and export includes source distinctions',async()=>{
  // Expose existing functions without mounting the browser app; render their real implementation.
  const contents=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8').replace('createRoot(document.getElementById("root")).render(<App />);','export { StudyGuide, toMarkmap };');
  const bundle=await build({stdin:{contents,resolveDir:new URL('../src/',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),loader:'jsx'},bundle:true,write:false,platform:'node',format:'cjs',external:['react','react-dom/client']});
  const mod={exports:{}}; new Function('require','module','exports',bundle.outputFiles[0].text)(require,mod,mod.exports);
  const {getStudyGuide}=await import('../src/studyGuides.js');const {getFocusGroups}=await import('../src/focusMap.js');
  const group=getFocusGroups('02')[0];const guide=getStudyGuide(group,group.items[0].id);
  const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
  const html=renderToStaticMarkup(React.createElement(mod.exports.StudyGuide,{guide:{...guide,caseStudy:fixture}}));
  assert.ok(html.indexOf('study-guide-grid')<html.indexOf('source-case-study'));
  assert.ok(html.indexOf('source-case-study')<html.indexOf('hypothetical-practice'));
  assert.ok(/<details class="hypothetical-practice"><summary>再看一个假设练习/.test(html));
  const plain=renderToStaticMarkup(React.createElement(mod.exports.StudyGuide,{guide:{...guide,caseStudy:null}}));
  assert.ok(!plain.includes('hypothetical-practice'));assert.ok(plain.includes('假设学习情境'));
  const markdown=mod.exports.toMarkmap();assert.ok(markdown.includes('资料记载'));assert.ok(markdown.includes('核验范围'));assert.ok(!markdown.includes('新情境均为假设'));
});
