import { ABaseRepository } from '../../../libs/abstract/base-repository.abstract';
import { AthleteEntity } from '../entities/athlete.entity';

export class AthleteRepository extends ABaseRepository<AthleteEntity> {
    constructor() {
        super(AthleteEntity);
    }
}
