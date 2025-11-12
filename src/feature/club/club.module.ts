import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { ClubController } from './club.controller';
import { ClubRepository } from './repository/club.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClubEntity } from './entities/club.entity';
import { WhiteLabelRepository } from './repository/white-label.repository';
import { WhiteLabelEntity } from './entities/white-label.entity';
import { UserModule } from '../user/user.module';
import { RevenueCatModule } from '../../libs/module/revenue-cat/revenue-cat.module';
import { PhotoModule } from '../photo/photo.module';

@Module({
    imports: [SequelizeModule.forFeature([ClubEntity, WhiteLabelEntity]), UserModule, RevenueCatModule, PhotoModule],
    controllers: [ClubController],
    providers: [ClubService, ClubRepository, WhiteLabelRepository],
    exports: [ClubService],
})
export class ClubModule {}
