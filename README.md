# Job Application Tracker

A clean, simple web app to track your job applications. Sign in with Google, add companies, track status, and keep notes.

## Features

- **Table view** – Company name, job title, intern/grad, status
- **Status options** – Not yet applied, Applied, Done OA, Behavioural Int, Technical Int, Final Round, Waiting on Offer
- **Notes** – Rich text editor with bold, italic, strikethrough, code, bullet/numbered lists
- **Company logos** – Drag & drop or click to upload
- **Google Sign-in** – Easy authentication

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In **Settings > API**, copy your project URL and anon key

### 2. Enable Google Auth

1. In Supabase: **Authentication > Providers > Google**
2. Enable Google and add your OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
3. Add your site URL (e.g. `http://localhost:5173`) to **Authentication > URL Configuration > Redirect URLs**

### 3. Set up the database

1. In Supabase: **SQL Editor**
2. Copy and run the contents of `supabase-schema.sql`

### 4. Configure the app

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase URL and anon key:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the app

```bash
pnpm install   # or npm install
pnpm dev       # or npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Usage

- **Add Company** – Click the button, enter details, optionally drag & drop a logo
- **View/Edit** – Click any row to open the company modal with notes
- **Change Status** – Use the dropdown in the table or in the modal
- **Notes** – Use the toolbar (B, I, S, lists) or select text to format
