import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCoachDto } from './create-coach.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCoachDto extends PartialType(CreateCoachDto) {
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
}
