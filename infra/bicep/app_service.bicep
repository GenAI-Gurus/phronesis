// Azure Bicep template for App Service (Linux, Docker Container)
//
// This template provisions an Azure Web App for Containers (Docker), not a Python code app.
// It is suitable for CI/CD workflows that deploy a Docker image (e.g., from GitHub Actions).
//
// Set the dockerImage param to your image reference (e.g., 'phronesis-backend:latest' or 'myregistry.azurecr.io/phronesis-backend:latest').

param appServicePlanName string = 'phronesis-appservice-plan'
param webAppName string = 'phronesis-backend-app'
param location string = resourceGroup().location

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

param dockerImage string = 'phronesis-backend:latest'

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${dockerImage}'
      alwaysOn: true
    }
  }
}
