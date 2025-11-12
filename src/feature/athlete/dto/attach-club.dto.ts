import { IsInt, IsNotEmpty } from 'class-validator';

export class AttachClubDto {
    @IsNotEmpty()
    @IsInt()
    clubId: number;
}
