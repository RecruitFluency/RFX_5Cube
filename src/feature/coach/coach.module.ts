import { Module } from '@nestjs/common';
import { CoachService } from './service/coach.service';
import { CoachController } from './coach.controller';
import { CoachRepository } from './repository/coach.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { CoachEntity } from './entities/coach.entity';
import { AthleteModule } from '../athlete/athlete.module';
import { CoachToAthleteRepository } from './repository/coach-to-athlete.repository';
import { CoachToAthleteEntity } from './entities/coach-to-athlete.entity';
import { CoachToAthleteService } from './service/coach-to-athlete.service';
import { PhotoModule } from '../photo/photo.module';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';
import { CsvParserModule } from '../../libs/module/csv-parser/csv-parser.module';

@Module({
    imports: [
        SequelizeModule.forFeature([CoachEntity, CoachToAthleteEntity]),
        AthleteModule,
        PhotoModule,
        CsvParserModule,
    ],
    controllers: [CoachController],
    providers: [CoachService, CoachToAthleteService, CoachRepository, CoachToAthleteRepository, PostmarkService],
    exports: [CoachService, CoachToAthleteService],
})
export class CoachModule {}
