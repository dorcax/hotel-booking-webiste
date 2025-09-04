import { SetMetadata } from "@nestjs/common"
import { Role } from "@prisma/client"

export const Role_key ="roles"
export const roles =(...roles:Role[])=>SetMetadata(Role_key,roles)