# Monkey Business Budget — Deploy to Your Phone

This is your budgeting app, packaged as a real project. Follow these steps —
all done by clicking around in a browser, no terminal needed.

## Step 1: Create a free GitHub account
Go to https://github.com and sign up (skip if you already have one).

## Step 2: Create a new repository
1. Click the "+" in the top right → "New repository"
2. Name it something like `monkey-budget-app`
3. Leave it Public, click "Create repository"

## Step 3: Upload these files
1. On your new repo page, click "Add file" → "Upload files"
2. Unzip this folder on your computer, then drag the *contents*
   (package.json, index.html, src folder, etc. — not the outer folder itself)
   into the upload box
3. Click "Commit changes"

## Step 4: Create a free Vercel account
Go to https://vercel.com and sign up using "Continue with GitHub"
(this connects the two automatically).

## Step 5: Deploy
1. In Vercel, click "Add New..." → "Project"
2. Select your `monkey-budget-app` repository → click "Import"
3. Vercel auto-detects it's a Vite app — just click "Deploy"
4. Wait ~1 minute. You'll get a live link like `monkey-budget-app.vercel.app`

## Step 6: Add it to your phone's home screen
- **iPhone (Safari):** open the link → tap the Share icon → "Add to Home Screen"
- **Android (Chrome):** open the link → tap the ⋮ menu → "Add to Home screen"

It'll now open full-screen with its own icon, just like a regular app.

## Good to know
This app doesn't have a database yet — it stores data only in memory while
the page is open, so closing/reloading resets it back to the sample data.
That's fine for trying it out, but if you want your real transactions to be
saved permanently, the next step would be adding a backend (a place to
store data). Come back and ask when you're ready for that — happy to help.
