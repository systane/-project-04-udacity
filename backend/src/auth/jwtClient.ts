import Axios from 'axios';
import { Jwk } from '../auth/Jwk';
import { SignKey } from '../auth/SignKey';

export class JwkClient {
    
    private options: any;

    constructor(options) {
        this.options = {strictSsl: true, ...options};
    }

    async getJwks(): Promise<Jwk[]> {
        const response = await Axios.get(this.options.jwksUri, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        return response.data.keys as Jwk[];
    };

    async getSigningKeys(): Promise<SignKey[]> {
        const jwkKeys = await this.getJwks();
        if(!jwkKeys || !jwkKeys.length) {
            throw new Error('Internal error - invalid certification endpoint');
        }

        const signingKeys = jwkKeys
        .filter(jwk => filterValidJwk(jwk))
        .map(jwk => {
            return {kid: jwk.kid, publicKey: certificateToPem(jwk.x5c[0])} as SignKey;
        });

        if(!signingKeys.length) {
            throw new Error('Internal error - there is no valid signature verification key');
            
        }

        return signingKeys;
    };

    async getSigningKey(kid: string): Promise<SignKey> {
        const jwkKeys = await this.getSigningKeys();
        const signingKey = jwkKeys.find(jwk => jwk.kid === kid);

        if(!signingKey) {
            throw new Error(`Internal error - Unable to find a compatible signing key that matches ${kid}`);
        }

        return signingKey;
    };
}

export function certificateToPem(certificate: string): string {
    let pem = certificate.match(/.{1, 64}/g).join('\n');
    return `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----\n`;
};

export function filterValidJwk(jwk: Jwk) {
    return jwk.use === 'sig' && jwk.kty === 'RSA' && jwk.kid && ((jwk.x5c && jwk.x5c.length) || (jwk.e && jwk.e));
};