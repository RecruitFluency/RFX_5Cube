import { Module } from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { AthleteController } from './athlete.controller';
import { AthleteRepository } from './repository/athlete.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { AthleteEntity } from './entities/athlete.entity';
import { UserModule } from '../user/user.module';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';
import { RevenueCatModule } from '../../libs/module/revenue-cat/revenue-cat.module';
import { PhotoModule } from '../photo/photo.module';
import { CsvParserModule } from '../../libs/module/csv-parser/csv-parser.module';

@Module({
    imports: [SequelizeModule.forFeature([AthleteEntity]), UserModule, RevenueCatModule, PhotoModule, CsvParserModule],
    controllers: [AthleteController],
    providers: [AthleteService, AthleteRepository, PostmarkService],
    exports: [AthleteService],
})
export class AthleteModule {}
