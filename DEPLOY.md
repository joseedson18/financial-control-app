# Deployment Guide for Financial Control App

This guide explains how to deploy your application to **Render**, a cloud hosting platform that supports both our Python backend and React frontend.

## Prerequisites
1.  A [GitHub](https://github.com/) account.
2.  A [Render](https://render.com/) account.

## Step 1: Push Code to GitHub
If you haven't already, push this project to a new GitHub repository.

1.  Initialize git (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy on Render
We have included a `render.yaml` file that automates the configuration.

1.  Log in to your [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub account and select the repository you just created.
4.  Render will detect the `render.yaml` file.
5.  Click **Apply**.

## Step 3: Final Configuration
Render will automatically:
1.  Build and deploy the **Backend** (Docker).
2.  Build and deploy the **Frontend** (Static Site).
3.  Set the `FRONTEND_URL` and `VITE_API_URL` environment variables automatically so they can talk to each other.

## Troubleshooting
-   **Build Errors**: Check the "Logs" tab in the Render dashboard for specific error messages.
-   **CORS Errors**: If the frontend cannot talk to the backend, ensure the `FRONTEND_URL` environment variable in the backend service matches the actual frontend URL.
