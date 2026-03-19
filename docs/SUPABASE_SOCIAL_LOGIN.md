# Supabase: Google & Sign in with Apple

The URL you see first (`https://YOUR_PROJECT.supabase.co/auth/v1/authorize?provider=apple&...`) is **normal**. The browser goes to **Supabase**, then Supabase sends you to **Apple**, then back to your app.

If the page says **“invalid response”** or breaks on that Supabase URL, the problem is almost always **provider configuration** (not your Next.js code).

---

## 1. Redirect URLs (all providers)

In **Supabase Dashboard → Authentication → URL Configuration**:

- Add **Site URL** (e.g. `http://localhost:3000` for dev).
- Under **Redirect URLs**, add:
  - `http://localhost:3000/auth/callback`
  - Your production URL, e.g. `https://yourdomain.com/auth/callback`

Use the exact path `/auth/callback` (this app’s route).

---

## 2. Google

1. **Authentication → Providers → Google** → Enable.
2. Create OAuth client in **Google Cloud Console** (Web application).
3. **Authorized redirect URI** in Google must be:

   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

   Replace `YOUR_PROJECT_REF` with the subdomain from your Supabase URL (e.g. `ajlmvtafchekjocncxrl`).

4. Paste **Client ID** and **Client Secret** into Supabase.

---

## 3. Sign in with Apple (often causes “invalid response” if incomplete)

Apple is stricter. Everything below must match.

### A. Apple Developer

1. **Certificates, Identifiers & Profiles → Identifiers**
2. Create a **Services ID** (e.g. `com.yourcompany.yourapp.web`).
3. Enable **Sign in with Apple** for that Services ID.
4. Configure **Web Authentication**:
   - **Domains and Subdomains**: `YOUR_PROJECT_REF.supabase.co` (no `https://`)
   - **Return URLs** (exactly one line per URL):

     `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

     Example: `https://ajlmvtafchekjocncxrl.supabase.co/auth/v1/callback`

5. Create a **Key** with **Sign in with Apple** enabled; download the **.p8** file. Note **Key ID** and your **Team ID**.

### B. Supabase

1. **Authentication → Providers → Apple** → Enable.
2. Fill in:
   - **Services ID** (same as Apple, e.g. `com.yourcompany.yourapp.web`)
   - **Secret Key** (contents of the `.p8` file)
   - **Key ID**
   - **Team ID**

If any field is wrong or the Return URL in Apple doesn’t match **exactly**, Supabase can fail when opening `/auth/v1/authorize?provider=apple`, which browsers may show as **“invalid response”**.

### C. Notes

- Apple **Secret Key** (JWT) expires; Supabase can rotate it—see [Supabase Apple docs](https://supabase.com/docs/guides/auth/social-login/auth-apple).
- For **local dev**, `redirect_to=http://localhost:3000/auth/callback` in the authorize URL is correct **after** Supabase + Apple are configured.
- If Google works but Apple doesn’t, focus on **Apple Services ID Return URL** and **Supabase Apple provider fields**.

---

## 4. Env vars (this repo)

In `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # anon public key, not service_role
```

Restart `npm run dev` after changes.
