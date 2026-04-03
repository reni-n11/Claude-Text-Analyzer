export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.CLAUDE_API_KEY, // съвпада с Environment Variable във Vercel
        'Anthropic-Version': '2023-06-01' // задължителен header
      },
      body: JSON.stringify({
        model: 'claude-3', // валиден модел за Messages API
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts topic, keywords, summary, and emotional tone from text. Return JSON with keys: topic, keywords, summary, emotion.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0,
        max_tokens_to_sample: 500
      }),
    });

    const data = await response.json();

    // Връщаме JSON от Claude
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
}