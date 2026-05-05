const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TRADITIONS = new Map([
  [
    "buddhism",
    {
      name: "Buddhism",
      sources: "the Pali Canon, Mahayana sutras, Dhamma teachings, and recognized Buddhist commentarial traditions",
    },
  ],
  [
    "christianity",
    {
      name: "Christianity",
      sources: "the Bible and widely recognized Christian teaching traditions",
    },
  ],
  [
    "hinduism",
    {
      name: "Hinduism",
      sources: "the Vedas, Upanishads, Bhagavad Gita, Ramayana, Mahabharata, Puranas, and other recognized Hindu scriptures and teachings",
    },
  ],
  [
    "islam",
    {
      name: "Islam",
      sources: "the Quran, authentic Hadith, Sunnah, and widely recognized Islamic teaching traditions",
    },
  ],
  [
    "sikhism",
    {
      name: "Sikhism",
      sources: "the Guru Granth Sahib, teachings of the Sikh Gurus, and recognized Sikh tradition",
    },
  ],
  [
    "judaism",
    {
      name: "Judaism",
      sources: "the Torah, Tanakh, Talmud, Midrash, and recognized Jewish teaching traditions",
    },
  ],
  [
    "taoism",
    {
      name: "Taoism",
      sources: "the Tao Te Ching, Zhuangzi, and recognized Taoist teaching traditions",
    },
  ],
  [
    "stoicism",
    {
      name: "Stoicism",
      sources: "Epictetus, Marcus Aurelius, Seneca, and other recognized Stoic writings",
    },
  ],
]);

const guidanceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    quote: {
      type: "string",
      description: "A direct quote from the selected tradition or source.",
    },
    source: {
      type: "string",
      description: "The book, chapter, verse, discourse, or teaching source for the quote.",
    },
    explanation: {
      type: "string",
      description: "A warm 3-5 sentence explanation tailored to the user's situation.",
    },
  },
  required: ["quote", "source", "explanation"],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function userFacingModelError(status = 502) {
  return jsonResponse(
    {
      error:
        "I could not shape the guidance clearly this time. Please try again with a little more detail about what you are facing.",
    },
    status,
  );
}

type Tradition = {
  name: string;
  sources: string;
};

function buildInstructions(tradition: Tradition) {
  return `You are a scholar and compassionate guide deeply versed in ${tradition.name}.

STEP 1 — UNDERSTAND THE CORE THEME
Before selecting a quote, identify the specific emotional or practical theme in the person's message.
Examples: grief, anxiety about the future, feeling overwhelmed by work, loneliness, self-worth, anger, duty vs. desire, family conflict, fear of failure, lack of purpose.
The theme must be SPECIFIC — not just "life" or "purpose."

STEP 2 — FIND A DIRECTLY RELEVANT QUOTE
Choose a quote from ${tradition.sources} that speaks DIRECTLY to that specific theme.
The quote must feel like it was written for this exact situation.

STRICT RULES for quote selection:
- Do NOT use a general quote about God's power, the creation of humans, the afterlife, or divine will UNLESS the person's question is specifically about those topics.
- Do NOT default to the most famous or commonly cited verse — think carefully about what actually fits.
- DO prefer quotes that offer practical comfort, balance, or actionable wisdom for the specific theme.
- Use REAL, ACCURATE text. If uncertain of exact wording, choose a different quote you are confident about.
- Do not invent chapter or verse numbers. If unsure of the exact reference, describe it clearly (e.g. "Hadith narrated by Bukhari", "Tao Te Ching, Chapter 8").

STEP 3 — EXPLAIN THE CONNECTION
Write 3–5 sentences that:
- Name what the person is going through
- Connect the specific words of the quote to their specific situation
- Offer grounded, warm, practical comfort — not generic spiritual advice

Draw from the breadth of the tradition: ${tradition.sources}.
If the person asks about the future, do not predict — offer wisdom for meeting uncertainty with steadiness.`;
}

function extractOutputText(data: any) {
  if (data.output_parsed && typeof data.output_parsed === "object") {
    return JSON.stringify(data.output_parsed);
  }

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  return data.output
    ?.flatMap((item: any) => item.content ?? [])
    ?.map((content: any) => {
      if (typeof content.text === "string") return content.text;
      if (content.parsed && typeof content.parsed === "object") {
        return JSON.stringify(content.parsed);
      }
      if (typeof content.refusal === "string") return "";
      return "";
    })
    ?.join("")
    ?.trim();
}

async function readOpenAiResponse(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("OpenAI returned non-JSON response", {
      status: response.status,
      bodyPreview: text.slice(0, 500),
      error,
    });
    return null;
  }
}

function parseGuidance(outputText: string) {
  try {
    const guidance = JSON.parse(outputText);
    if (
      typeof guidance?.quote !== "string" ||
      typeof guidance?.source !== "string" ||
      typeof guidance?.explanation !== "string"
    ) {
      console.error("Model JSON did not match guidance shape", { guidance });
      return null;
    }
    return guidance;
  } catch (error) {
    console.error("Could not parse model JSON", {
      outputPreview: outputText.slice(0, 500),
      error,
    });
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAiKey) {
    return jsonResponse({ error: "OpenAI API key is not configured" }, 500);
  }

  let payload: { religionId?: string; problem?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request body" }, 400);
  }

  const tradition = payload.religionId ? TRADITIONS.get(payload.religionId) : null;
  const problem = payload.problem?.trim();

  if (!tradition) {
    return jsonResponse({ error: "Choose a supported tradition" }, 400);
  }

  if (!problem) {
    return jsonResponse({ error: "Describe what you want guidance on" }, 400);
  }

  if (problem.length > 2000) {
    return jsonResponse({ error: "Please keep your question under 2,000 characters" }, 400);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o",
        instructions: buildInstructions(tradition),
        input: problem,
        max_output_tokens: 1200,
        text: {
          format: {
            type: "json_schema",
            name: "spiritual_guidance",
            strict: true,
            schema: guidanceSchema,
          },
        },
      }),
    });

    const data = await readOpenAiResponse(response);

    if (!response.ok) {
      console.error("OpenAI API error", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        data,
      });
      return jsonResponse({ error: "Could not generate guidance right now" }, 502);
    }

    if (!data) {
      return userFacingModelError();
    }

    if (data.status === "incomplete") {
      console.error("OpenAI response incomplete", {
        responseId: data.id,
        incompleteDetails: data.incomplete_details,
      });
      return userFacingModelError();
    }

    const refusal = data.output
      ?.flatMap((item: any) => item.content ?? [])
      ?.find((content: any) => typeof content.refusal === "string")?.refusal;

    if (refusal) {
      console.error("OpenAI refused guidance request", {
        responseId: data.id,
        refusal,
      });
      return userFacingModelError(400);
    }

    const outputText = extractOutputText(data);
    if (!outputText) {
      console.error("OpenAI response had no output text", {
        responseId: data.id,
        status: data.status,
        outputTypes: data.output?.map((item: any) => item.type),
      });
      return userFacingModelError();
    }

    const guidance = parseGuidance(outputText);
    if (!guidance) {
      return userFacingModelError();
    }

    return jsonResponse(guidance);
  } catch (error) {
    console.error("Guidance function error", error);
    return jsonResponse({ error: "Something went wrong while generating guidance" }, 500);
  }
});
