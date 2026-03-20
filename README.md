# Gujarat Form App · ગુજરાત ફોર્મ અ​પ

A Next.js citizen registration form with bilingual (English / Gujarati) labels, cascading location dropdowns, MongoDB submission storage, and a hidden admin dashboard.

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/gujarat-form
DASHBOARD_EMAIL=admin@example.com
DASHBOARD_PASSWORD=yourSecurePassword
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the form.

---

## 📂 Project Structure

```
gujarat-form-app/
├── app/
│   ├── page.js              # Home page — public form
│   ├── page.module.css
│   ├── layout.js
│   ├── globals.css
│   ├── dashboard/
│   │   ├── page.js          # Hidden admin dashboard
│   │   ├── dashboard.module.css
│   │   └── layout.js
│   └── api/
│       ├── submissions/route.js   # GET / POST submissions
│       └── auth/route.js          # Dashboard login
├── models/
│   ├── Submission.js        # Mongoose model for form data
│   └── User.js              # Mongoose model for users
├── lib/
│   └── dbConnect.js         # MongoDB connection helper
└── data/
    └── gujarat.json         # All districts / talukas / villages
```

---

## 🗺️ Pages

| Route        | Access | Description                      |
| ------------ | ------ | -------------------------------- |
| `/`          | Public | Main citizen registration form   |
| `/dashboard` | Hidden | Admin login + submissions viewer |

The dashboard link is **not mentioned anywhere** on the public site. Users must manually navigate to `/dashboard`.

---

## 🧩 Data Format

`data/gujarat.json` follows this schema:

```json
{
  "state": "Gujarat",
  "districts": [
    {
      "name": "Ahmedabad",
      "talukas": [
        {
          "name": "Daskroi",
          "villages": ["Narol", "Vatva", "Isanpur"]
        }
      ]
    }
  ]
}
```

To add or modify districts, talukas, or villages — edit this file directly.

---

## 🖨️ Print / PDF

From the dashboard, click **Print PDF** to open a print-ready window with all visible submissions in a clean table format. Use the browser's **Print → Save as PDF** option.

---

## 🔐 Dashboard Credentials

Set via environment variables:

- `DASHBOARD_EMAIL` — admin email
- `DASHBOARD_PASSWORD` — admin password (plaintext, change for production)

---

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **Mongoose / MongoDB**
- **CSS Modules** (no UI library dependency)
