const TIMEOUT_MS = 30_000;

interface ImproveTextResponse {
  improved_text: string;
}

interface ReportSummaryResponse {
  summary: string;
}

export interface ReportSummaryEntry {
  entryType: string;
  feedbackType: string | null;
  feedbackGiven: boolean | null;
  situation: string | null;
  behavior: string | null;
  impact: string | null;
  title: string | null;
  notes: string | null;
  providerName: string | null;
  linkedGoals: string[];
}

export interface ReportSummaryPayload {
  report: { firstName: string; lastName: string };
  goals: { title: string; description: string | null }[];
  entries: ReportSummaryEntry[];
}

async function callN8nWebhook(url: string, body: unknown): Promise<string | Record<string, unknown>> {
  const authToken = process.env.N8N_WEBHOOK_AUTH_TOKEN;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`N8N webhook returned ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();

    // Try parsing as JSON first, fall back to plain text
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return text;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('AI service request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function improveText(text: string, context: string): Promise<string> {
  const url = process.env.N8N_IMPROVE_TEXT_WEBHOOK_URL;
  if (!url) {
    throw new Error('N8N_IMPROVE_TEXT_WEBHOOK_URL is not configured');
  }

  const result = await callN8nWebhook(url, { text, context });

  // Handle plain text response
  if (typeof result === 'string') {
    if (!result.trim()) {
      throw new Error('Invalid response from AI service: empty text');
    }
    return result.trim();
  }

  // Handle JSON response: { improved_text: "..." }
  const improved = (result as unknown as ImproveTextResponse).improved_text;
  if (!improved || typeof improved !== 'string') {
    throw new Error('Invalid response from AI service: missing improved_text');
  }

  return improved;
}

export async function generateReportSummary(payload: ReportSummaryPayload): Promise<string> {
  const url = process.env.N8N_REPORT_SUMMARY_WEBHOOK_URL;
  if (!url) {
    throw new Error('N8N_REPORT_SUMMARY_WEBHOOK_URL is not configured');
  }

  const result = await callN8nWebhook(url, payload);

  // Handle plain text response
  if (typeof result === 'string') {
    if (!result.trim()) {
      throw new Error('Invalid response from AI service: empty summary');
    }
    return result.trim();
  }

  // Handle JSON response: { summary: "..." }
  const summary = (result as unknown as ReportSummaryResponse).summary;
  if (!summary || typeof summary !== 'string') {
    throw new Error('Invalid response from AI service: missing summary');
  }

  return summary;
}
