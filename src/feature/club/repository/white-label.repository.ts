import { ABaseRepository } from '../../../libs/abstract/base-repository.abstract';
import { WhiteLabelEntity } from '../entities/white-label.entity';

export class WhiteLabelRepository extends ABaseRepository<WhiteLabelEntity> {
    constructor() {
        super(WhiteLabelEntity);
    }
}
