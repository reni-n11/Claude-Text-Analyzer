export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ANTHROPIC_API_KEY, // увери се, че името съвпада с това в Vercel Environment Variables
        'Anthropic-Version': '2023-06-01' // задължителен header
      },
      body: JSON.stringify({
        model: 'claude-opus-4.5', // използвай модел, който твоят API key поддържа
        prompt: `\n\nHuman: Extract the following from the text below and return the answer in JSON with keys "topic", "keywords", "summary", "emotion":

Text:
${text}

Assistant:`,
        max_tokens_to_sample: 500,
        temperature: 0,
      }),
    });

    const data = await response.json();

    // Връщаме директно JSON-а от Claude
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
}