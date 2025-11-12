import { EUserRole } from '../../../libs/enum/user-role.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    fullName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    // @IsStrongPassword({ minLength: 1 })
    password: string;

    @ApiProperty({ enum: [EUserRole.ATHLETE, EUserRole.CLUB] })
    @IsNotEmpty()
    @IsEnum([EUserRole.ATHLETE, EUserRole.CLUB])
    role: EUserRole;
}
