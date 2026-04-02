function decodeHtmlEntities(text = '') {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'");
}

function stripHtml(html = '') {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<li>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function normalizeMessagePayload(payload, fallbackSubject = 'AI 技术情报') {
  if (typeof payload === 'string') {
    const html = payload;
    const text = stripHtml(payload);
    return {
      subject: fallbackSubject,
      html,
      text,
      markdown: text
    };
  }

  const html = payload?.html || '';
  const text = payload?.text || stripHtml(html);

  return {
    subject: payload?.subject || fallbackSubject,
    html,
    text,
    markdown: payload?.markdown || text
  };
}

module.exports = {
  decodeHtmlEntities,
  stripHtml,
  normalizeMessagePayload
};
