import { BaseQueryDto } from '../../../libs/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindStatisticsDto extends BaseQueryDto {
    @ApiProperty()
    @IsOptional()
    @IsISO8601()
    @Transform(({ value }) => (value as string) || null)
    from: string;

    @ApiProperty()
    @IsOptional()
    @IsISO8601()
    @Transform(({ value }) => (value as string) || null)
    to: string;

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    athleteId: number;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }: { value: string | undefined }): boolean | null =>
        value === '' || value === undefined ? null : JSON.parse(value),
    )
    isInterested: boolean;

    @ApiProperty({ required: false, description: 'Used only for querying a single athlete stats' })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    topInterests: number;
}
