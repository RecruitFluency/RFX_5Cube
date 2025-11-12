import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsRepository } from './statistics.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { StatisticsEntity } from './entities/statistics.entity';
import { AthleteModule } from '../athlete/athlete.module';
import { CoachModule } from '../coach/coach.module';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';

@Module({
    imports: [SequelizeModule.forFeature([StatisticsEntity]), AthleteModule, CoachModule],
    controllers: [StatisticsController],
    providers: [StatisticsService, StatisticsRepository, PostmarkService],
    exports: [StatisticsService],
})
export class StatisticsModule {}
