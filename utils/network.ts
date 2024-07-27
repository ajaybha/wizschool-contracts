import 'dotenv/config';

export function node_url(networkName: string): string {
    if (networkName) {
      const uri = process.env['ZKEVM_NODE_URI_' + networkName.toUpperCase()];
      if (uri && uri !== '') {
        return uri;
      }
    }
     
    if (networkName === 'localhost') {
      // do not use ZKEVM_NODE_URI
      return 'http://localhost:8545';
    }
    
    let uri = process.env.ZKEVM_NODE_URI;
    if (uri) {
      uri = uri.replace('{{networkName}}', networkName);
    }
    if (!uri || uri === '') {
      // throw new Error(`environment variable "ZKEVM_NODE_URI" not configured `);
      return '';
    }
    if (uri.indexOf('{{') >= 0) {
      throw new Error(`invalid uri or network not supported by node provider : ${uri}`);
    }
    return uri;
}
export function account_pk(account: string): string {
  if(account) {
      const key = `ACCOUNT_PRIV_KEY_${account.toUpperCase()}`;
      const pkval = process.env[key];
      /*console.log(`inputs:${account} key:${key}`);
      console.log(`env:${process.env[key]}`);
      console.log(`pk: ${pkval}`);*/
      if(pkval && pkval !== '') {
          return `0x${pkval}`;
      }
  }
  return '';
}
export function ethscan_key(networkName: string): string {
  if(networkName) {
      const key = `ETHSCAN_APIKEY_${networkName.toUpperCase()}`;
      const scanApiKey = process.env[key];
      /*console.log(`inputs:${networkName} key:${key}`);
      console.log(`env:${process.env[key]}`);
      console.log(`scanApiKey: ${scanApiKey}`);*/
      if(scanApiKey && scanApiKey !== '') {
          return scanApiKey;
      }
  }
  return '';
}
export function contract_addr(contractNamePrefix: string, networkName: string): string {
    if(contractNamePrefix && networkName) {
        const key = `${contractNamePrefix.toUpperCase()}_CONTRACT_ADDRESS_${networkName.toUpperCase()}`;
        const addr = process.env[key];
        /*console.log(`inputs:${contractNamePrefix} ${networkName} key:${key}`);
        console.log(`env:${process.env[key]}`);
        console.log(`addr: ${addr}`);*/
        if(addr && addr !== '') {
            return addr;
        }
    }
    return '';
}
  