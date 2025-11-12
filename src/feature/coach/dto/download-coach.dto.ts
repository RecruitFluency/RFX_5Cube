import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum } from '../../../libs/enum/gender.enum';

export class DownloadCoachDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;

    @ApiProperty({ enum: Object.values(GenderEnum), required: false })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender: GenderEnum;
}
