import { JwtPayloadModel } from './JwtPayloadModel'
import { JwtHeader } from 'jsonwebtoken'

/**
 * Interface representing a JWT token
 */
export interface JwtModel {
  header: JwtHeader
  payload: JwtPayloadModel
}
