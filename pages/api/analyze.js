export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/complete', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ANTHROPIC_API_KEY,
        'Anthropic-Version': '2023-06-01' // задължителен header
    },
    body: JSON.stringify({
        model: 'claude-3', // или друг Claude модел
        prompt: `\n\nHuman: Extract the following from the text below:
        - Topic
        - Keywords
        - Summary
        - Emotional tone

    Text:
    ${text}
    `,
        max_tokens_to_sample: 500,
        temperature: 0,
    }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
}