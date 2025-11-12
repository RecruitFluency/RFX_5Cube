import { BaseQueryDto } from '../../../libs/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsISO8601, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatTypeEnum } from '../enum/stat-type.enum';
import { DivisionEnum } from '../../coach/enum/division.enum';

export class FindAdminStatisticsDto extends BaseQueryDto {
    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    athleteId: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsISO8601()
    @Transform(({ value }) => (value as string) || null)
    from: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsISO8601()
    @Transform(({ value }) => (value as string) || null)
    to: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(StatTypeEnum)
    type: StatTypeEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : value === 'true'))
    @IsBoolean()
    isInterested: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(DivisionEnum)
    division: DivisionEnum;
}
