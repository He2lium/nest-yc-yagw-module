import * as jose from "jose";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type YagwJwtPayloadType<PayloadType, ScopesEnum> = jose.JWTPayload & { scopes: ScopesEnum[] } & PayloadType
export const YagwJwtPayload = <PayloadType, ScopesEnum>() =>
  createParamDecorator((data: unknown, ctx: ExecutionContext): YagwJwtPayloadType<PayloadType, ScopesEnum> => {
    const req = ctx.switchToHttp().getRequest();
    const payload = jose.decodeJwt(req.headers["authorization"].replace("Bearer ", "")) as YagwJwtPayloadType<PayloadType, ScopesEnum>;
    return {
      ...payload,
      scopes: ((payload.scope as string)?.split(' ') as ScopesEnum[]) ?? []
    };
  });