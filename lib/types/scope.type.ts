/**
 * Example: AuthRoleType<typeof UserRole, Scopes>
 */
export type YagwRoleType<RoleEnum, ScopeEnum> = { [key in keyof RoleEnum]: Array<ScopeEnum> }

export const YagwRoleMergerFactory = <AuthRoleType>(AuthRole: AuthRoleType) =>
    (roles: string[], toString: boolean = false): string[] | string => {
        let scopes: string[] = []
        for (let role of roles) {
            scopes = [...scopes, ...AuthRole[role]]
        }
        const set = [...new Set(scopes)]

        return toString ? set.join(' ') : set
    }