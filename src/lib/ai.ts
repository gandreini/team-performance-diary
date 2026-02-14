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

async function callN8nWebhook<T>(url: string, body: unknown): Promise<T> {
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

    const data = await response.json();
    return data as T;
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

  const result = await callN8nWebhook<ImproveTextResponse>(url, { text, context });

  if (!result.improved_text || typeof result.improved_text !== 'string') {
    throw new Error('Invalid response from AI service: missing improved_text');
  }

  return result.improved_text;
}

export async function generateReportSummary(payload: ReportSummaryPayload): Promise<string> {
  const url = process.env.N8N_REPORT_SUMMARY_WEBHOOK_URL;
  if (!url) {
    throw new Error('N8N_REPORT_SUMMARY_WEBHOOK_URL is not configured');
  }

  const result = await callN8nWebhook<ReportSummaryResponse>(url, payload);

  if (!result.summary || typeof result.summary !== 'string') {
    throw new Error('Invalid response from AI service: missing summary');
  }

  return result.summary;
}
