import { EAthleteType } from '../enum/athlete-type.enum';
import { ESportType } from '../enum/sport-type.enum';
import { EPositionType } from '../enum/position-type.enum';
import { EFootType } from '../enum/foot-type.enum';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsISO8601,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EFinance } from '../enum/finance.enum';
import { GenderEnum } from '../../../libs/enum/gender.enum';

export class CreateAthleteDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    graduationYear: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsISO8601()
    dateOfBirth: Date;

    @ApiProperty({ enum: Object.values(EAthleteType) })
    @IsNotEmpty()
    @IsEnum(EAthleteType)
    type: EAthleteType;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    city: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    state: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    country: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    phone: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    userNameX: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    userNameYoutube: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    userNameInstagram: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    leagueName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    clubName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    coachName: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    coachEmail: string;

    @ApiProperty({ enum: Object.values(ESportType) })
    @IsNotEmpty()
    @IsEnum(ESportType)
    sportType: ESportType;

    @ApiProperty({ enum: Object.values(EPositionType) })
    @IsNotEmpty()
    @IsEnum(EPositionType)
    primaryPosition: EPositionType;

    @ApiProperty({ enum: Object.values(EPositionType) })
    @IsNotEmpty()
    @IsEnum(EPositionType)
    secondaryPosition: EPositionType;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    heightFt: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    heightIn: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weightLbs: number;

    @ApiProperty({ enum: Object.values(EFootType) })
    @IsNotEmpty()
    @IsEnum(EFootType)
    dominantFoot: EFootType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    oneMileTime: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    twoMileTime: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    fortyYardDashTime: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    act: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    sat: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    gpa: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    weightedGpa: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    ncaa: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    naia: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    classRank: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    plannedFieldOfStudy: string;

    @ApiProperty({ enum: Object.values(EFinance) })
    @IsNotEmpty()
    @IsEnum(EFinance)
    finance: EFinance;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isLeadershipPosition: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isNewClub: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    fileId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUrl(
        {
            require_protocol: true,
            require_valid_protocol: true,
            host_whitelist: ['www.youtube.com', 'youtube.com', 'youtu.be'],
        },
        { message: `youtubeLink must be a YouTube URL address with protocol` },
    )
    @MaxLength(255)
    youtubeLink: string;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isStatsExposed: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    customerId: string;

    @ApiProperty({ enum: Object.values(GenderEnum) })
    @IsNotEmpty()
    @IsEnum(GenderEnum)
    gender: GenderEnum;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(2)
    @Matches(/^\d{2}$/)
    jerseyNumber: string;
}
