export type AuthRoleType<RoleEnum, ScopeEnum> = { [key in RoleEnum]: Array<ScopeEnum> }

export const AuthRoleMerger = (AuthRole: {[key: string]: string}) => (roles: string[], toString: boolean = false): string[] | string => {
    let scopes: string[] = []
    for (let role of roles) {
        scopes = [...scopes, ...AuthRole[role]]
    }
    const set = [...new Set(scopes)]

    return toString ? set.join(' ') : set
}