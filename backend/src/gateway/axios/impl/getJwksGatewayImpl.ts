import { GetJwksGateway } from '../getJwksGateway'
import Axios from 'axios';
import { JwkModel } from '../../../models/JwkModel';
const jwksUrl = 'https://dev-s7jtff97.us.auth0.com/.well-known/jwks.json'

export class GetJwksGatewayImpl implements GetJwksGateway {
    
    async execute(): Promise<JwkModel[]> {
        const response = await Axios.get(jwksUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        return response.data.keys as JwkModel[];
    };
}