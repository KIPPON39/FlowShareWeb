<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/18ce3ccc-9d08-43c4-87d4-019f3ac8c2f7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend bridge with n8n and Google Sheets

FlowShare reads workflows from `/api/workflows` and submits new workflows to n8n. n8n should handle the Google Sheets write/read operations.

### Environment variables

Copy `.env.example` to `.env.local` or add these values to your existing `.env`:

- `N8N_WORKFLOW_WEBHOOK_URL`: n8n POST webhook that receives new workflows.
- `N8N_WEBHOOK_SECRET`: optional shared secret sent as `x-flowshare-secret`.
- `N8N_LIST_WEBHOOK_URL`: optional n8n GET webhook that returns workflows from Google Sheets.
- `GOOGLE_SHEETS_CSV_URL`: optional published Google Sheet CSV URL used when no list webhook is set.

### n8n POST workflow

Create a Webhook node with method `POST`, then append/upsert the incoming `workflow` object into Google Sheets.

FlowShare sends this shape:

```json
{
  "action": "upsert_workflow",
  "source": "flowshare-web",
  "workflow": {
    "id": "ai-renewal-health-monitor",
    "title": "AI Renewal Health Monitor",
    "description": "Workflow summary",
    "tags": ["Community"],
    "keys": ["Google Sheets", "OpenAI API"],
    "creators": [{ "name": "You", "email": "me@example.com" }],
    "nodes": 2,
    "steps": [{ "id": "1", "title": "Fetch data", "nodeName": "Google Sheets" }],
    "createdAt": "2026-05-07T00:00:00.000Z"
  }
}
```

Recommended Google Sheet columns:

`id,title,description,tags,keys,creators,nodes,steps,created_at`

Store `tags` and `keys` as comma-separated text. Store `creators` and `steps` as JSON strings.
