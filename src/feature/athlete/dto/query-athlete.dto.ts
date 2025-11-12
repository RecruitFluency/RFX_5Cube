import { BaseQueryDto } from '../../../libs/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { GenderEnum } from '../../../libs/enum/gender.enum';

export class QueryAthlete extends BaseQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    clubId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : (JSON.parse(value) as boolean)))
    isClubMember: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : (JSON.parse(value) as boolean)))
    isSubscriptionActive: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : Number(value)))
    @IsInt()
    graduationYearFrom: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : Number(value)))
    @IsInt()
    graduationYearTo: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender: GenderEnum;
}
