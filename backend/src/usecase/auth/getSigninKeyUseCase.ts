import { JwkModel } from '../../models/JwkModel';
import { SignKeyModel } from '../../models/SignKeyModel';
import { GetJwksGateway } from '../../gateway/axios/getJwksGateway';
import { GetJwksGatewayImpl } from '../../gateway/axios/impl/getJwksGatewayImpl';
import { createLogger } from '../../utils/logger';

export class GetSigningKey {
    
    constructor(
        private readonly getJwkGateway: GetJwksGateway = new GetJwksGatewayImpl(),
        private readonly logger = createLogger('auth')
    ){}

    async execute(kid: string): Promise<SignKeyModel> {
        const jwkKeys = await this.getSigningKeys();
        const signingKey = jwkKeys.find(jwk => jwk.kid === kid);

        if(!signingKey) {
            this.logger.error('unable to find a compatible signing key');
            throw new Error(`Internal error - Unable to find a compatible signing key that matches ${kid}`);
        }

        return signingKey;
    };

    async getSigningKeys(): Promise<SignKeyModel[]> {
        const jwkKeys = await this.getJwkGateway.execute();
        if(!jwkKeys || !jwkKeys.length) {
            this.logger.error('invalid certification endpoint');
            throw new Error('Internal error - invalid certification endpoint');
        }

        const signingKeys = jwkKeys
        .filter(jwk => filterValidJwk(jwk))
        .map(jwk => {
            return {kid: jwk.kid, publicKey: certificateToPem(jwk.x5c[0])} as SignKeyModel;
        });
        
        if(!signingKeys.length) {
            this.logger.error('there is no valid signature verificartion key');
            throw new Error('Internal error - there is no valid signature verification key');
        }

        return signingKeys;
    };

    
}

export function certificateToPem(certificate: string): string {
    return '-----BEGIN CERTIFICATE-----\n' +
    certificate +
    '\n-----END CERTIFICATE-----';
};

export function filterValidJwk(jwk: JwkModel) {
    return jwk.use === 'sig' && jwk.kty === 'RSA' && jwk.kid && ((jwk.x5c && jwk.x5c.length) || (jwk.e && jwk.e));
};