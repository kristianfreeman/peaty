import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { analyzeSchema } from '~/schema';

type Entry = {
  id: number;
  date: string;
  time: string;
  temperature: number;
}

type Response = {
  entries: Entry[];
}

export async function action({ context, request }: LoaderFunctionArgs) {
  const gatewayUrl = "https://gateway.ai.cloudflare.com/v1/dc56444c4c955a1653106ccf997c1067/peaty-temp/openai"
  const openai = createOpenAI({
    apiKey: context?.cloudflare?.env?.OPENAI_API_KEY,
    baseUrl: gatewayUrl,
  });

  const { entries } = await request.json<Response>();

  const prompt = `Analyze the following body temperature data:
${entries.map((e: any) => `${e.date} ${e.time}: ${e.temperature}°F`).join('\n')}

Consider Dr. Ray Peat's principles:
1. Morning temperature should be around 98°F (36.6°C)
2. Temperature should rise to 98.6°F (37.1°C) by mid-morning

Provide an analysis of the data, including:
1. Whether the temperatures align with Dr. Peat's recommendations
2. Any trends or patterns in the data`;

  const result = await streamObject({
    model: openai('gpt-4o-2024-08-06', {
      structuredOutputs: true,
    }),
    schemaName: 'analysis',
    schemaDescription: 'Analysis of body temperature data',
    schema: analyzeSchema,
    prompt
  });

  return result.toTextStreamResponse();
}
