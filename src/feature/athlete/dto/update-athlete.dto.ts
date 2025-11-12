import { PartialType } from '@nestjs/swagger';
import { CreateAthleteDto } from './create-athlete.dto';

export class UpdateAthleteDto extends PartialType(CreateAthleteDto) {
    isSubscriptionActive?: boolean;
    clubId?: number;
}
