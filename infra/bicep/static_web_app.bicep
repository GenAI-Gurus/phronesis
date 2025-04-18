// Bicep template for Azure Static Web App (Phronesis Frontend)
// Docs: https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-bicep

param name string = 'phronesis-frontend-app'
param location string = resourceGroup().location
param sku string = 'Free'
param repositoryUrl string // e.g. 'https://github.com/genai-gurus/phronesis'
param branch string = 'main'
param appLocation string = 'frontend' // Path to app source in repo
param outputLocation string = 'dist'  // Build output folder

resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: appLocation
      outputLocation: outputLocation
    }
    allowConfigFileUpdates: true
  }
}

output staticWebAppName string = staticWebApp.name
output staticWebAppUrl string = staticWebApp.properties.defaultHostname
