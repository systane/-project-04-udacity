/**
 * A payload of a JWT token
 */
export interface JwtPayloadModel {
  iss: string
  sub: string
  iat: number
  exp: number
}
