import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DivisionEnum } from '../enum/division.enum';
import { GenderEnum } from '../../../libs/enum/gender.enum';
import { Transform } from 'class-transformer';

export class CreateCoachDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(DivisionEnum)
    division: DivisionEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    institute: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    fileId: number;

    @ApiProperty({ enum: Object.values(GenderEnum) })
    @IsNotEmpty()
    @IsEnum(GenderEnum)
    gender: GenderEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    role: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title: string;
}
