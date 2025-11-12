import { ABaseRepository } from '../../../libs/abstract/base-repository.abstract';
import { CodeEntity } from '../entity/code.entity';

export class CodeRepository extends ABaseRepository<CodeEntity> {
    constructor() {
        super(CodeEntity);
    }
}
