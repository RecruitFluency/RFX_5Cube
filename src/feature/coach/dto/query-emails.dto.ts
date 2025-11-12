import { BaseQueryDto } from '../../../libs/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryEmailsDto extends BaseQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value ? Number(value) : void 0))
    coachId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ each: true })
    @Transform(({ value }) => ((value as string[]) || []).filter(Boolean).map((e) => e.replaceAll(' ', '+')))
    @IsEmail({}, { each: true })
    coachEmails: string[];
}
