import { Injectable } from '@nestjs/common';
import { ABaseRepository } from '../../../libs/abstract/base-repository.abstract';
import { CoachEntity } from '../entities/coach.entity';
import { CreationAttributes, Transaction } from 'sequelize';

@Injectable()
export class CoachRepository extends ABaseRepository<CoachEntity> {
    constructor() {
        super(CoachEntity);
    }

    async create(model: CreationAttributes<CoachEntity>, transaction?: { transaction: Transaction }) {
        if (model.email) {
            model.email = model.email.toLowerCase();
        }

        return await super.create(model, transaction);
    }
}
