# N8N Workflows

Two workflow JSON files for the AI features. Import them into your N8N instance.

## Setup

### 1. Set Anthropic API Key in N8N

Go to **Settings > Variables** in your N8N instance and add:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

### 2. Import Workflows

1. In N8N, go to **Workflows > Import from File**
2. Import `improve-text-workflow.json`
3. Import `report-summary-workflow.json`
4. Activate both workflows

### 3. Get Webhook URLs

After activating each workflow, click the Webhook node to see its production URL. It will look like:

```
https://your-n8n-instance.com/webhook/improve-text
https://your-n8n-instance.com/webhook/report-summary
```

### 4. Configure the App

Add the webhook URLs to your `.env`:

```
N8N_IMPROVE_TEXT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/improve-text
N8N_REPORT_SUMMARY_WEBHOOK_URL=https://your-n8n-instance.com/webhook/report-summary
```

Optionally, if you enabled webhook authentication in N8N:

```
N8N_WEBHOOK_AUTH_TOKEN=your-token
```

## Workflows

### TPD - Improve Text

`Webhook` -> `Call Anthropic` -> `Extract Text` -> `Respond`

- **Input:** `{ text: string, context: string }`
- **Output:** `{ improved_text: string }`
- Uses Claude Sonnet to improve grammar, clarity, and readability
- Preserves markdown formatting and original tone

### TPD - Report Summary

`Webhook` -> `Build Prompt` -> `Call Anthropic` -> `Extract Summary` -> `Respond`

- **Input:** `{ report: { firstName, lastName }, goals: [...], entries: [...] }`
- **Output:** `{ summary: string }`
- Builds a structured prompt from all entries grouped by type
- Generates a markdown summary with: overall assessment, strengths, growth areas, goal progress, recommendations

## Customization

- Change the model by editing the `model` field in the HTTP Request node (e.g., `claude-sonnet-4-5-20250514` -> `claude-haiku-4-5-20251001` for faster/cheaper responses)
- Adjust the prompt in the Code node to change summary format or text improvement style
- Add pre/post-processing steps as needed (e.g., content filtering, logging)
