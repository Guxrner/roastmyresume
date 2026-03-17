import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { cvText, level, lang } = req.body;
  if (!cvText) return res.status(400).json({ error: 'No CV text provided' });

  const prompts = {
    en: {
      medium: `You are a brutally honest but helpful career coach. Analyze this CV and respond ONLY with valid JSON (no markdown, no backticks): {"score":<1-100>,"roast":"<2-3 paragraphs honest critique with specific examples>","fixes":"<numbered list 1-5 of specific actionable improvements>"}`,
      savage: `You are the most brutally honest career coach alive. Analyze this CV and respond ONLY with valid JSON (no markdown, no backticks): {"score":<1-100>,"roast":"<2-3 paragraphs savage critique with dark humor and specific examples>","fixes":"<numbered list 1-5 of urgent fixes>"}`
    },
    es: {
      medium: `Eres un coach de carrera brutalmente honesto. Analiza este CV y responde SOLO con JSON válido (sin markdown, sin backticks): {"score":<1-100>,"roast":"<2-3 párrafos de crítica honesta con ejemplos específicos>","fixes":"<lista numerada 1-5 de mejoras específicas>"}`,
      savage: `Eres el coach de carrera más brutalmente honesto del mundo. Analiza este CV y responde SOLO con JSON válido (sin markdown, sin backticks): {"score":<1-100>,"roast":"<2-3 párrafos de crítica salvaje con humor negro y ejemplos específicos>","fixes":"<lista numerada 1-5 de correcciones urgentes>"}`
    }
  };

  const systemPrompt = prompts[lang]?.[level] || prompts.en.medium;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: `CV to analyze:\n\n${cvText.substring(0, 4000)}` }]
    });

    const raw = message.content[0].text;
    const clean = raw.replace(/```json|```/g, '').trim();
    const i1 = clean.indexOf('{'), i2 = clean.lastIndexOf('}');
    const parsed = JSON.parse(clean.substring(i1, i2 + 1));

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}