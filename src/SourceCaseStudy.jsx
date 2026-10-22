import React from "react";

export default function SourceCaseStudy({ study }) {
  if (!study) return null;
  return <section className="source-case-study" aria-label="来源案例背诵卡">
    <h3>{study.title}</h3>
    <p className="source-case-summary">{study.summary}</p>
    <div className="source-case-provenance"><p>来源：{study.source.label}</p><p>核验状态：{study.source.status}</p></div>
    <div className="source-case-recall"><h4>30秒复述</h4><p>{study.recall}</p></div>
    <details className="source-case-details"><summary>展开案例事实与逐点讲解</summary>
      <section><h4>资料记载</h4><p>{study.source.label}</p><p>{study.source.facts}</p></section>
      <section><h4>核验状态与范围</h4><p>{study.source.status}</p><p>{study.source.scope}</p></section>
      <section><h4>逐点讲解</h4>{study.steps.map((step, index) => <div key={index}><h5>{step.title}</h5><p>{step.text}</p></div>)}</section>
      <section><h4>教学推演</h4><p>{study.analysis}</p></section>
      <section><h4>联想记忆</h4><p>{study.association}</p></section>
      <section><h4>适用边界</h4><p>{study.boundary}</p></section>
      <section><h4>来源</h4>{study.source.links.length ? <ul>{study.source.links.map((link,index) => <li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul> : <p>来源为上方案例库条目，尚无独立核验的公开一手链接。</p>}</section>
    </details>
    <section className="source-case-quizzes"><h4>案例自测 · 先答再核对</h4>{study.quizzes.map((quiz,index) => <details key={index}><summary>{quiz.question}</summary><p>{quiz.answer}</p></details>)}</section>
  </section>;
}
