import { Injectable } from '@nestjs/common';
import { ABaseRepository } from '../../libs/abstract/base-repository.abstract';
import { UserEntity } from './entities/user.entity';
import { CreationAttributes, Transaction } from 'sequelize';

@Injectable()
export class UserRepository extends ABaseRepository<UserEntity> {
    constructor() {
        super(UserEntity);
    }

    async create(model: CreationAttributes<UserEntity>, transaction?: { transaction: Transaction }) {
        if (model.email) {
            model.email = model.email.toLowerCase();
        }

        return await super.create(model, transaction);
    }
}
