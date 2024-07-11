import {ApiProperty, ApiPropertyOptions} from "@nestjs/swagger";
import {applyDecorators} from "@nestjs/common";
import {IsNotEmpty, IsOptional} from "class-validator";

export const YagwApiProperty = (options?: ApiPropertyOptions) => applyDecorators(
    ApiProperty(options),
    options?.required === false ? IsOptional() : IsNotEmpty()
)