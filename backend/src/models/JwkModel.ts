/**
 * Interface representing a Json Web Key (jwk)
 */
export interface JwkModel {
    alg: string
    kty: string
    use: string
    x5c: string[]
    e: string
    kid: string
    x5t: string
  }