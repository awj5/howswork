"use server";

import type { ConcernActivityType } from "@/types";

export async function generateRiskResponse(activity: ConcernActivityType[]) {
  try {
    const systemPrompt = `You are a workplace risk advisor for HowsWork, a psychosocial risk management platform.

Based on the activity log below, draft a brief summary of how this concern was handled for the risk register.

Return plain text only — no JSON, no labels, no formatting.

The summary should be:
- Written in neutral third person (e.g. "The concern was reviewed..." not "We reviewed...")
- Two to three sentences maximum
- Focused on what actions were taken and the outcome or current status
- Written in past tense
- Free of any identifying details about the employee or admin

Do not:
- Prefix the response with labels like "Update:" or "Summary:"
- Include recommendations or speculate on future actions
- Repeat the original concern description — focus only on what was done and what changed`;

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
    if (!response.ok) throw new Error(json.error?.message ?? `OpenAI error ${response.status}`);
    const result = json.choices[0].message.content;
    if (!result) throw new Error("Response is empty");
    return result;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function suggestActions(description: string) {
  try {
    const systemPrompt = `You are a workplace risk advisor for HowsWork, a psychosocial risk management platform.

Based on the risk description below, suggest practical actions an employer can take to address the issue.

This risk was identified through anonymous employee feedback. Suggested actions must preserve that anonymity — do not recommend any steps that could identify, single out, or pressure individual employees.

Return three to five suggested actions, numbered and each separated by an empty line, like this:

1. Action one goes here

2. Action two goes here

3. Action three goes here

Each action should be:
- Written as a direct instruction to the employer (e.g. "Meet with the team to..." not "You should meet..." or "Consider meeting...")
- Specific and actionable — not generic platitudes
- Proportionate to the nature and severity of the risk
- Focused on investigation, mitigation, or prevention — not just documentation
- Written in plain, direct language — no corporate jargon

Do not:
- Recommend surveys, assessments, or other data gathering — the risk has already been identified through employee feedback
- Recommend establishing reporting channels or mechanisms — employees already have a confidential reporting channel through HowsWork
- Recommend actions that could reveal or narrow down who raised the concern
- Include caveats like "if appropriate" or "where possible"
- Recommend external referrals (e.g. EAP, lawyers) unless the risk is clearly serious
- Repeat or paraphrase the risk description back as an action
- Offer legal advice or make compliance claims`;

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
            content: description,
          },
        ],
        max_tokens: 350,
        temperature: 0.2,
      }),
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.error?.message ?? `OpenAI error ${response.status}`);
    const result = json.choices[0].message.content;
    if (!result) throw new Error("Response is empty");
    return result;
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
