import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IBaseQuery } from '../interface/base/base-query.interface';
import { ApiProperty } from '@nestjs/swagger';

export class BaseQueryDto implements IBaseQuery {
    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    offset?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    sort?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    asc?: 0 | 1;

    @ApiProperty({ required: false })
    @IsOptional()
    q?: string;
}
