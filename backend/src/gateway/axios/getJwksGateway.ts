import { JwkModel } from "../../models/JwkModel";

export interface GetJwksGateway {
    execute():Promise<JwkModel[]>
}