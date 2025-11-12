import { Injectable } from '@nestjs/common';
import { ABaseRepository } from '../../libs/abstract/base-repository.abstract';
import { PhotoEntity } from './entity/photo.entity';
import { photoDefaultInfo } from '../../libs/const/scope.const';

@Injectable()
export class PhotoRepository extends ABaseRepository<PhotoEntity> {
    constructor() {
        super(PhotoEntity, photoDefaultInfo);
    }
}
