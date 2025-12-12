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
