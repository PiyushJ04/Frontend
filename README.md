# Marklane frontend

Standalone React/Vite frontend for AI Edu Assess. This repository can be
deployed independently from the backend.

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Keep the project root as `/` (the repository root).
3. Use the Vite defaults, or set the build command to `npm run build` and the
   output directory to `dist`.
4. Add the environment variable `VITE_API_URL` with the backend API URL,
   for example `https://backend-pl8j.onrender.com/api/v1`.
5. Deploy. `vercel.json` rewrites frontend routes to `index.html`.

## Deploy to Netlify

1. Import this GitHub repository into Netlify.
2. Set the build command to `npm run build` and publish directory to `dist`.
3. Add `VITE_API_URL` with the backend API URL, for example
   `https://backend-pl8j.onrender.com/api/v1`.
4. Deploy. `netlify.toml` rewrites frontend routes to `index.html`.

## Connect the backend

After deployment, copy the frontend's exact public URL and add it to the
backend's `CORS_ORIGINS` setting as a JSON array, for example:

```text
["https://your-frontend.example"]
```

Save the backend environment setting and redeploy the backend. Never put
database credentials, JWT secrets, or other private credentials in frontend
environment variables: Vite variables are included in the public browser code.

## Local development

```sh
npm ci
npm run dev
```

Set `VITE_API_URL` in a local `.env` file to the backend API URL when running
the frontend locally, for example
`https://backend-pl8j.onrender.com/api/v1`. The app defaults to
`http://localhost:8000/api/v1`.
