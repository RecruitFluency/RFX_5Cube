import { BaseQueryDto } from '../../../libs/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { DivisionEnum } from '../enum/division.enum';
import { GenderEnum } from '../../../libs/enum/gender.enum';

export class QueryCoachDto extends BaseQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? null : (JSON.parse(value) as boolean)))
    isDeleted: boolean;

    @ApiProperty({ required: false, enum: Object.values(GenderEnum) })
    @IsOptional()
    @IsEnum(DivisionEnum)
    division: DivisionEnum;

    @ApiProperty({ required: false, enum: Object.values(GenderEnum) })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender: GenderEnum;
}
