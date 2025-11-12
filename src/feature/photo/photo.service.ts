import { Injectable, NotFoundException } from '@nestjs/common';
import { PhotoRepository } from './photo.repository';
import { Transaction } from 'sequelize';

@Injectable()
export class PhotoService {
    constructor(private readonly photoRepository: PhotoRepository) {}

    async upload(file: Express.Multer.File) {
        const photo = await this.photoRepository.create({ file: file.buffer, fileName: file.originalname });
        return { success: true, id: photo.id };
    }

    async findOne(id: number) {
        const photo = await this.photoRepository.findById(id, { attributes: ['id', 'url', 'file'] });

        if (!photo) {
            throw new NotFoundException('Photo not found');
        }

        return photo;
    }

    async checkIfExistsAndThrow(id: number, transaction?: Transaction) {
        const isExists = await this.photoRepository.count({ where: { id }, transaction });

        if (!isExists) {
            throw new NotFoundException('File with such id not found');
        }
    }
}
