<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# FlowShare Web 🚀
**The centralized automation platform for organizational personnel, by FlowShare.**
</div>

---

## 🌟 Overview
**FlowShare Web** is a Next.js platform designed to act as a central hub for automation workflows. It allows teams to discover, share, and request automation templates across the organization. It integrates deeply with **n8n** and **Google Sheets** to provide a serverless edge-data architecture, eliminating the need for traditional relational databases.

## ✨ Features
- 🔐 **Secure Authentication**: Managed via Google Sheets with a robust Superadmin bypass system.
- 🧩 **Workflow Hub**: Browse, view JSON, download, and invite speakers for automation templates.
- 🤖 **AI Integration**: Powered by the Gemini API to automatically extract metadata and credentials from n8n JSON exports.
- 📊 **Dynamic Admin Panel**: Manage all underlying Google Sheets IDs and dynamic settings (like Social Media Links) without touching code.
- 🌍 **Internationalization (i18n)**: Fully supports English and Thai natively via Context API.
- 💅 **Modern Aesthetics**: Built with TailwindCSS and Lucide Icons for a beautiful, responsive UI.

---

## 🚀 Getting Started

### Prerequisites
Before running the project locally, ensure you have:
- Node.js (v18+)
- npm or yarn
- An active [n8n](https://n8n.io/) instance with configured webhooks
- A Google Service Account (for Google Sheets integrations)

### Installation Guide

**1. Clone the repository:**
```bash
git clone <your-repo-url>
cd FlowShareWeb
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up Environment Variables:**
You need to configure the environment variables for your application to communicate with n8n and Google Sheets.
```bash
# Copy the example environment file
cp .env.example .env
```
*(Open `.env` in your text editor and fill in your webhook URLs and API keys. Refer to the `.env.example` file for detailed comments on each variable).*

**4. Run the Development Server:**
```bash
npm run dev
```
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

---

## 🛠️ Environment Variables Configuration

The `.env` file requires several webhook endpoints from your n8n workflows and your Google Sheets setup. 

### Essential Variables You Must Configure:
- `N8N_WEBHOOK_SECRET`: Secure token to validate requests between this app and your n8n workflows (`x-flowshare-secret`).
- `GEMINI_API_KEY`: Used to power the "Auto Extract" AI features during flow uploads.
- `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD`: Use these to bypass standard login if your Google Sheets connection breaks. This guarantees you will always have access to the `/admin` panel.

> **💡 Tip:** See the `.env.example` file for a full list of all 20+ variables grouped logically (Auth, n8n Webhooks, Google Sheets, AI).

---

## 📂 Architecture

- **Frontend**: [Next.js 15 (App Router)](https://nextjs.org/), TailwindCSS, Lucide Icons.
- **Backend/API**: Next.js Serverless Route Handlers (`app/api/*`).
- **Database/Storage**: Google Sheets (bridged automatically via n8n workflows).
- **Styling**: Vanilla CSS Variables (`globals.css`) combined with Tailwind utility classes for maximum flexibility.

---

## 📄 License
© 2026 FlowShare. All rights reserved.
