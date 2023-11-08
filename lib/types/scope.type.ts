/**
 * Example: AuthRoleType<typeof UserRole, Scopes>
 */
export type AuthRoleType<RoleEnum, ScopeEnum> = { [key in keyof RoleEnum]: Array<ScopeEnum> }

export const AuthRoleMerger = <AuthRoleType>(AuthRole: AuthRoleType) =>
    (roles: string[], toString: boolean = false): string[] | string => {
        let scopes: string[] = []
        for (let role of roles) {
            scopes = [...scopes, ...AuthRole[role]]
        }
        const set = [...new Set(scopes)]

        return toString ? set.join(' ') : set
    }


export enum UserRole {
    user = 'user',
    administrator = 'administrator',
    moderator = 'moderator'
}

export enum Scopes {
    moderatingRealEstate = 're:mo',
    moderatingTenant = 're:te',
    moderatingWarehouse = 're:wh',
}

const AuthRole: AuthRoleType<typeof UserRole, Scopes> = {
    user: [],
    administrator: Object.values(Scopes),
    moderator: Object.values(Scopes)
}
export const RoleMerger1 = AuthRoleMerger<typeof AuthRole>(AuthRole)