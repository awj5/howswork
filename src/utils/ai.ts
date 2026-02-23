"use server";

export async function generateRiskResponse(activity: unknown[]) {
  console.log(activity);
  try {
    const systemPrompt = `You are a response drafting assistant for HowsWork, a workplace psychosocial safety platform.

Based on the activity log below, draft a brief summary of how this concern was resolved for the risk register.

Return plain text only — no JSON, no labels, no formatting.

The response should be:
- Written in neutral third person (e.g. "The concern was reviewed..." not "We reviewed...")
- Two to three sentences maximum
- Focused on what actions were taken and how the concern was ultimately resolved
- Written in past tense to reflect that the matter is closed
- Free of any identifying details about the employee or admin

Do not:
- Prefix the response with labels like "Update:" or "Summary:"
- Include recommendations or speculate on future actions
- Repeat the original concern description — focus only on what happened and how it was resolved`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(activity),
          },
        ],
        max_tokens: 350,
        temperature: 0.2,
      }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error.message);
    const result = json.choices[0].message.content;
    if (!result) throw new Error("Response is empty");
    return result;
  } catch (error) {
    console.error(error);
    return "";
  }
}
