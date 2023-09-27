import {Inject} from "@nestjs/common";
import {YAGW_OPTIONS_TOKEN} from "../yagw.constants";

export const InjectYagwOptions = ()=> Inject(YAGW_OPTIONS_TOKEN)