// Bicep template for Azure Virtual Network and subnets for App Service and SQL Private Endpoint
// See: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-deployment-models

param vnetName string = 'phronesis-vnet'
param location string = resourceGroup().location
param addressPrefix string = '10.10.0.0/16'
param appSubnetPrefix string = '10.10.1.0/24'
param sqlSubnetPrefix string = '10.10.2.0/24'

resource vnet 'Microsoft.Network/virtualNetworks@2023-02-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [addressPrefix]
    }
    subnets: [
      {
        name: 'appservice-subnet'
        properties: {
          addressPrefix: appSubnetPrefix
          delegations: [
            {
              name: 'appservice'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
            }
          ]
        }
      }
      {
        name: 'sql-private-endpoint'
        properties: {
          addressPrefix: sqlSubnetPrefix
        }
      }
    ]
  }
}

output vnetId string = vnet.id
output appSubnetId string = vnet.properties.subnets[0].id
output sqlSubnetId string = vnet.properties.subnets[1].id
