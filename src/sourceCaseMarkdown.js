const escape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/([\\`*_\[\]{}()#+.!|~-])/g, "\\$1").replace(/\r?\n/g, " ");

export function sourceCaseToMarkdown(study) {
  if (!study) return [];
  const line = (label, value) => `- ${label}：${escape(value)}`;
  return [line("来源案例", study.title), line("一句对应", study.summary), line("30秒复述", study.recall),
    line("资料出处", study.source.label), line("资料记载", study.source.facts), line("核验状态", study.source.status), line("核验范围", study.source.scope),
    ...study.steps.map(step => line(`逐点讲解 · ${escape(step.title)}`, step.text)),
    line("教学推演", study.analysis), line("联想记忆", study.association), line("适用边界", study.boundary),
    ...study.source.links.map(link => `- 来源：[${escape(link.label)}](<${link.url.replace(/[<>\s()]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}>)`),
    ...study.quizzes.flatMap(quiz => [line("案例自测", quiz.question), `  ${line("参考答案", quiz.answer)}`])];
}
