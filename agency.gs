const EMAIL_TO = Session.getActiveUser().getEmail(); // or 'you@example.com'
const EMAIL_SUBJECT = 'Daily AI/Tech Summary';
const TIMEZONE = 'Australia/Sydney';

// --- MAIN ---
function sendDailySummary() {
  const content = callOpenAI(DAILY_PROMPT);
  const body = [
    `Hi, here’s your daily summary (${Utilities.formatDate(new Date(), TIMEZONE, 'EEE, d MMM yyyy')}):`,
    '',
    content,
    '',
    '— Your scheduled agent'
  ].join('\n');

  GmailApp.sendEmail(EMAIL_TO, EMAIL_SUBJECT, body);
}

// --- OPENAI CALL ---
function callOpenAI(userPrompt) {
  const url = 'https://api.openai.com/v1/responses';
  const payload = {
    model: MODEL,
    input: userPrompt,
    // You can add system guidance for tone/policies:
    // "modalities": ["text"], // optional, defaults to text
    tools: [
      { type: 'web_search' }             // enable built-in web search
    ],
    tool_choice: 'auto',  
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    muteHttpExceptions: true,
  });

  const data = JSON.parse(res.getContentText() || '{}');
  // The Responses API returns text in data.output_text for convenience:
  // Fallback to choices if needed.
  
  return data.output.at(-1).content[0].text || 'No content returned.';
