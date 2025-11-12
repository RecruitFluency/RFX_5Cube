import { StatTypeEnum } from '../enum/stat-type.enum';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatisticDto {
    @ApiProperty({ enum: StatTypeEnum })
    @IsNotEmpty()
    @IsEnum(StatTypeEnum)
    type: StatTypeEnum;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    athleteId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    coachId: number;

    @ApiProperty()
    @ValidateIf((dto: CreateStatisticDto) => dto.type === StatTypeEnum.INTEREST)
    @IsNotEmpty()
    @IsBoolean()
    isInterested?: boolean;
}
