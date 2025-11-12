import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsOptional } from 'class-validator';

export class UpdateWhiteLabelDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    primaryColor: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    accentColor: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    fontColor: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    fontColorSecondary: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    inputBackgroundColor: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsHexColor()
    inputBorderColor: string;
}
