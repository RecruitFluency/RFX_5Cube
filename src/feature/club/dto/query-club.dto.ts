import { BaseQueryDto } from '../../../libs/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryClubDto extends BaseQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : (JSON.parse(value) as boolean)))
    isActiveSubscription: boolean;
}
