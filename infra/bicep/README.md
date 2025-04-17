# Azure Bicep Deployment Instructions

This directory contains Infrastructure-as-Code (IaC) templates for deploying the Phronesis backend to Azure. All resources are designed for minimal fixed cost and easy scaling.

## Resources
- **App Service:** Linux, Docker Container (Web App for Containers), minimal instance size, autoscale
- **SQL Database:** Basic/serverless tier
- **Blob Storage:** Pay-as-you-go
- **Key Vault:** For secrets
- **Application Insights:** Free tier

## Deployment Steps

1. **Login to Azure CLI**
   ```sh
   az login
   az account set --subscription <your-subscription-id>
   ```

2. **Create a resource group**
   ```sh
   az group create --name phronesis-rg --location westeurope
   ```

3. **Deploy resources**
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
