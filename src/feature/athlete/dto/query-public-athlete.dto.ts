import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPublicAthleteDto {
    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    coachId: number;
}
