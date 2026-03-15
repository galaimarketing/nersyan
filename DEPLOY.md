# Push to GitHub & Deploy on Vercel

## 1. Push to GitHub

The project is already committed locally. Do the following:

### Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new).
2. Choose a **Repository name** (e.g. `nersyan` or `nersian-taiba`).
3. Leave it **empty** (no README, .gitignore, or license).
4. Click **Create repository**.

### Add remote and push

In your terminal, from the project folder, run (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name):

```bash
cd /Users/alaalkalai/Desktop/Nersyan

git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

If you use SSH instead:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use **Continue with GitHub**).
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repository (e.g. `nersyan`).
4. Vercel will detect Next.js. Keep the defaults:
   - **Framework Preset:** Next.js  
   - **Build Command:** `next build` (or leave default)  
   - **Output Directory:** (leave default)  
   - **Install Command:** `npm install` or `pnpm install` if you use pnpm  
5. Click **Deploy**.

After the build finishes, you’ll get a URL like `https://nersyan-xxx.vercel.app`. You can add a custom domain later in the project **Settings** on Vercel.

### Optional: use pnpm on Vercel

If the repo uses pnpm, in the Vercel project **Settings → General** set **Install Command** to `pnpm install` (or enable “Override” and use `pnpm i`). Vercel will then use pnpm for installs and builds.
