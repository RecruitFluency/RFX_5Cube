import { Injectable } from '@nestjs/common';
import { ABaseRepository } from '../../../libs/abstract/base-repository.abstract';
import { CoachToAthleteEntity } from '../entities/coach-to-athlete.entity';

@Injectable()
export class CoachToAthleteRepository extends ABaseRepository<CoachToAthleteEntity> {
    constructor() {
        super(CoachToAthleteEntity);
    }
}
