# Deploy Notes (Updated)

The backend now ships with standalone configuration, utility, response, and middleware modules expected by project verification
scripts. No additional deployment steps are required; ensure environment variables (e.g., `ENVIRONMENT`, `LOG_LEVEL`) are set as
needed before starting the service.

To run the API locally or on a server, use the updated helper script:

```bash
chmod +x run_backend.sh
HOST=0.0.0.0 PORT=8000 WORKERS=2 RELOAD=false ./run_backend.sh
```

The script binds to `HOST`/`PORT` with configurable workers and optional reload, making it suitable for containerized deployments
and Render-style environments.

## Render (Docker) deployment

The provided `render.yaml` and `backend/Dockerfile` are wired for Render's docker runtime:

1. Confirm `render.yaml` is present at the repo root (Render will auto-detect it). The backend service now references
   `backend/Dockerfile` from the repository root, ensuring the package layout is preserved during the build.
2. In the Render dashboard, create two services with the names in the YAML: `financial-control-backend` (Docker) and
   `financial-control-frontend` (static). Render will auto-wire URLs between them using the `fromService` entries.
3. Set the minimum environment variables in Render (the YAML will pre-create most keys):
   - `SECRET_KEY` (auto-generated on first deploy unless you override)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` **or** `ADMIN_USERS_JSON`
   - `FRONTEND_URL` / `FRONTEND_URLS` are auto-synced from the static frontend service via `fromService`; override only if you
     are hosting the frontend elsewhere.
4. On deployment, Render will build the image with Python 3.11, install `backend/requirements.txt`, copy the `backend/`
   package, and launch `uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}`.
5. If you need to run locally using the same container definition, execute:

```bash
docker build -f backend/Dockerfile -t financial-control .
docker run --rm -p 8000:8000 \
  -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD=strongpass \
  financial-control
```
