// Azure Bicep template for SQL Database (Basic, low cost)
param sqlServerName string = 'phronesis-sqlserver'
param sqlDbName string = 'phronesisdb'
param adminLogin string
param adminPassword string
param location string = resourceGroup().location

resource sqlServer 'Microsoft.Sql/servers@2022-02-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    version: '12.0'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  name: '${sqlServer.name}/${sqlDbName}'
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    maxSizeBytes: 2147483648
  }
}
