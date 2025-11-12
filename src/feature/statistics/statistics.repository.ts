import { Injectable } from '@nestjs/common';
import { ABaseRepository } from '../../libs/abstract/base-repository.abstract';
import { StatisticsEntity } from './entities/statistics.entity';

@Injectable()
export class StatisticsRepository extends ABaseRepository<StatisticsEntity> {
    constructor() {
        super(StatisticsEntity);
    }
}
