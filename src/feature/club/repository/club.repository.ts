import { ABaseRepository } from '../../../libs/abstract/base-repository.abstract';
import { ClubEntity } from '../entities/club.entity';

export class ClubRepository extends ABaseRepository<ClubEntity> {
    constructor() {
        super(ClubEntity);
    }
}
