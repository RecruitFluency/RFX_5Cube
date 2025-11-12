import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { EUserRole } from '../../../libs/enum/user-role.enum';

export class InviteFollowUpDto {
    @ApiProperty({ enum: Object.values(EUserRole) })
    @IsNotEmpty()
    @IsEnum(EUserRole)
    role: EUserRole;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    isClubMember: boolean;
}
