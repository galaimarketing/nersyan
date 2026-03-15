# Trusted HTTPS for local development (Safari)

Next.js’s built-in `--experimental-https` uses a self-signed certificate that Safari often rejects. To get a **trusted** HTTPS connection so Safari (and the Vimeo hero video) work:

1. **Install mkcert** (one time):
   ```bash
   brew install mkcert
   mkcert -install
   ```

2. **Generate certificates** (one time, from project root):
   ```bash
   cd certificates
   mkcert localhost 127.0.0.1 ::1
   cd ..
   ```
   This creates `localhost+2.pem` and `localhost+2-key.pem` in this folder.

3. **Run the dev server with trusted HTTPS**:
   ```bash
   pnpm run dev:https:trusted
   ```
   Then open **https://localhost:3000** in Safari. The connection will be trusted and the hero video should work.
