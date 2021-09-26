import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtModel } from '../../models/JwtModel'
import { JwtPayloadModel } from '../../models/JwtPayloadModel'
import { GetSigningKey } from '../../usecase/auth/getSigninKeyUseCase'

const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayloadModel> {
  const token = getToken(authHeader)
  const jwt: JwtModel = decode(token, { complete: true }) as JwtModel


  if(jwt.header.alg !== 'RS256') {
    logger.error('invalid token');
    throw new Error('invalid token');
  }

  const client = new GetSigningKey();
  const signingKey = await client.execute(jwt.header.kid);
  return verify(token, signingKey.publicKey) as JwtPayloadModel;
};

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer ')){
    logger.error('invalid authentication header');
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  return token
};
