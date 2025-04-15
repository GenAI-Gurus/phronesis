// Azure Bicep template for SQL firewall rules
param sqlServerName string
param startIp string = '0.0.0.0'
param endIp string = '0.0.0.0'

resource allowAzureServices 'Microsoft.Sql/servers/firewallRules@2022-02-01-preview' = {
  name: '${sqlServerName}/AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource allowDevIp 'Microsoft.Sql/servers/firewallRules@2022-02-01-preview' = {
  name: '${sqlServerName}/AllowDevIp'
  properties: {
    startIpAddress: startIp
    endIpAddress: endIp
  }
}
