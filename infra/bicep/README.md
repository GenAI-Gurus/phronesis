# Azure Bicep Deployment Instructions

## Organization & Repo Info
- GitHub Organization: genai-gurus
- Main Repo: https://github.com/genai-gurus/phronesis
- Azure Resource Prefix: phronesis
- Default Branch: main


This directory contains Infrastructure-as-Code (IaC) templates for deploying the Phronesis backend to Azure. All resources are designed for minimal fixed cost and easy scaling.

## General Setup

1. **Login to Azure CLI**
   ```sh
   az login
   az account set --subscription <your-subscription-id>
   ```

2. **Create a resource group**
   ```sh
   az group create --name phronesis-rg --location westeurope
   ```

## Resources
- **App Service:** Linux, Docker Container (Web App for Containers), minimal instance size, autoscale
- **SQL Database:** Basic/serverless tier
- **Blob Storage:** Pay-as-you-go
- **Key Vault:** For secrets
- **Application Insights:** Free tier
- **Static Web App (Frontend):** Azure Static Web App for React/Vite SPA (see below)

---

## Frontend Deployment: Azure Static Web App

This section describes how to deploy the Phronesis frontend as an Azure Static Web App using Bicep.

### Overview
- Deploys a globally distributed, secure, and cost-effective static site for the React/Vite frontend.
- Integrates with GitHub for CI/CD.
- Managed SSL, custom domains, and environment variables supported.

### Prerequisites
- Azure CLI installed and logged in.
- Resource group created (see above).
- GitHub repository with the frontend code.

### Deploy the Static Web App

1. **Update parameters as needed:**
   - `name`: Name for your Static Web App (must be globally unique)
   - `repositoryUrl`: Your GitHub repo URL (e.g., `https://github.com/genai-gurus/phronesis`)
   - `branch`: Branch to deploy from (default: `main`)
   - `appLocation`: Path to frontend source in repo (default: `frontend`)
   - `outputLocation`: Build output (default: `dist`)

2. **Deploy with Azure CLI:**
   ```sh
   az deployment group create \
     --resource-group phronesis-rg \
     --template-file static_web_app.bicep \
     --parameters \
       name=phronesis-frontend-app \
       repositoryUrl=https://github.com/genai-gurus/phronesis \
       branch=main
   ```

3. **Configure Environment Variables (App Settings):**
   - In the Azure Portal, go to your Static Web App resource → Configuration.
   - Add `VITE_API_URL` with your backend’s Azure endpoint.

4. **Push to GitHub:**
   - Any push to the selected branch triggers CI/CD and deploys the latest frontend.

5. **Custom Domain & HTTPS (Optional):**
   - Add your custom domain in the Azure Portal.
   - Azure manages SSL certificates automatically.

### GitHub Actions Workflow (Required)

To enable automatic deployment of the frontend to Azure Static Web Apps, you must add a GitHub Actions workflow:

1. **Workflow File:** `.github/workflows/azure-static-web-apps.yml`
2. **Secret:** Add your Azure Static Web Apps deployment token as a repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`.
   - Get the token from the Azure Portal → Your Static Web App → Deployment Token.
   - In GitHub: Settings → Secrets and variables → Actions → New repository secret.
3. **How it works:**
   - On every push or PR to `main`, the workflow will build the frontend (`frontend/`), output to `dist/`, and deploy to Azure Static Web Apps.
   - You can customize the workflow as needed for additional build/test steps.

**Workflow reference:**

See the maintained workflow at [`.github/workflows/azure-static-web-apps.yml`](../../.github/workflows/azure-static-web-apps.yml) for build and deployment details.

### References
- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/overview)
- [Bicep Static Web App Reference](https://learn.microsoft.com/en-us/azure/templates/microsoft.web/staticsites)

---

## Backend Deployment Steps

1. **Deploy resources**
   - App Service (Docker):
     ```sh
     az deployment group create \
       --resource-group phronesis-rg \
       --template-file app_service.bicep \
       --parameters appServicePlanName=phronesis-appservice-plan webAppName=phronesis-backend-app dockerImage=phronesis-backend:latest
     ```
     > **Note:** The `dockerImage` parameter must be set to your Docker image reference (e.g., `phronesis-backend:latest`, or your ACR/Docker Hub image). This is required for GitHub Actions or container-based deployment.

   - SQL Database:
     ```sh
     az deployment group create \
       --resource-group phronesis-rg \
       --template-file sql_database.bicep \
       --parameters sqlServerName=phronesis-sqlserver sqlDbName=phronesisdb adminLogin=<admin> adminPassword=<password>
     ```
   - Blob Storage:
     ```sh
     az deployment group create \
       --resource-group phronesis-rg \
       --template-file blob_storage.bicep \
       --parameters storageAccountName=phronesisst
     ```
   - Key Vault:
     ```sh
     az deployment group create \
       --resource-group phronesis-rg \
       --template-file key_vault.bicep \
       --parameters keyVaultName=phronesis-keyvault
     ```
   - Application Insights:
     ```sh
     az deployment group create \
       --resource-group phronesis-rg \
       --template-file app_insights.bicep \
       --parameters appInsightsName=phronesis-appinsights
     ```
   
   - SQL Firewall (optional):

       Note: SQL firewall is optional to allow access from your IP. Access from Azure resources is allowed by default.
     ```sh
     az deployment group create \
       --resource-group phronesis-rg \
       --template-file sql_firewall.bicep \
       --parameters sqlServerName=phronesis-sqlserver startIp=<your-ip> endIp=<your-ip>
     ```

## Notes
- All parameters can be customized as needed.
- For lowest cost, use Basic or Serverless tiers and minimal instance sizes.
- Key Vault is recommended for production secrets.
