// Bicep template for Azure SQL Database Private Endpoint
// See: https://learn.microsoft.com/en-us/azure/private-link/create-private-endpoint-template

param sqlServerName string
param sqlDbName string
param vnetResourceGroup string = resourceGroup().name
param vnetName string = 'phronesis-vnet'
param subnetName string = 'sql-private-endpoint'
param location string = resourceGroup().location

resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-02-01' = {
  name: '${sqlServerName}-pe'
  location: location
  properties: {
    subnet: {
      id: resourceId(vnetResourceGroup, 'Microsoft.Network/virtualNetworks/subnets', vnetName, subnetName)
    }
    privateLinkServiceConnections: [
      {
        name: '${sqlServerName}-plsc'
        properties: {
          privateLinkServiceId: resourceId('Microsoft.Sql/servers', sqlServerName)
          groupIds: ['sqlServer']
        }
      }
    ]
  }
}

output sqlPrivateEndpointId string = sqlPrivateEndpoint.id
