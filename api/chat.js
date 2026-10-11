import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY missing' });
  }
  const { messages } = req.body;

  const groq = new Groq({ apiKey });

  const systemPrompt = `أنت مساعد العسول للسياحة في شمال تركيا، خبير في طرابزون، ريزا، آيدر، أوزنجول، حيدر نبي، سوميلا، دير سوميلا، مرتفعات السلطان مراد.
ترد بلهجة سعودية خفيفة ومفهومة، سريع البديهة، تعطي إجابات عملية: مسافات، طرق، أفضل أوقات، أسعار تقريبية، اقتراح برامج 3-5 أيام.
لا تكرر نفس الجواب أبدا. كل سؤال له جواب مختلف ومفصل.
إذا سأل عن طرابزون: اذكر بحيرة أوزنجول، مرتفعات آيدر، قصر أتاتورك، بازار طرابزون، مطل بوزتبه.
إذا سأل عن برنامج: رتب يوم بيوم مع أوقات.
كن سريع ومباشر وودود.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10)
      ],
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content);
      }
    }
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
