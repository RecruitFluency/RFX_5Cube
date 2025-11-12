import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { EUserStatus } from '../../../libs/enum/user-status.enum';

export class InviteDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    clubId?: number;
    status?: EUserStatus;
}
