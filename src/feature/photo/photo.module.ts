import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { PhotoRepository } from './photo.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { PhotoEntity } from './entity/photo.entity';

@Module({
    imports: [SequelizeModule.forFeature([PhotoEntity])],
    controllers: [PhotoController],
    providers: [PhotoService, PhotoRepository],
    exports: [PhotoService],
})
export class PhotoModule {}
