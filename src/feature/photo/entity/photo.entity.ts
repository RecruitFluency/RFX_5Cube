import { Column, DataType, HasMany, Model, Scopes, Table } from 'sequelize-typescript';
import { AthleteEntity } from '../../athlete/entities/athlete.entity';
import { ClubEntity } from '../../club/entities/club.entity';
import { photoDefaultInfo } from '../../../libs/const/scope.const';

@Scopes(() => ({
    [photoDefaultInfo]: {
        attributes: ['id', 'url'],
    },
}))
@Table({ tableName: 'photo', freezeTableName: true, timestamps: true })
export class PhotoEntity extends Model<PhotoEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    fileName: string;

    @Column({ type: DataType.BLOB('long'), allowNull: false })
    file: Buffer;

    @Column({
        type: DataType.VIRTUAL,
        get() {
            const id: number = this.getDataValue('id');

            return `${process.env.SERVER_HOST}/api/photo/${id}`;
        },
    })
    url: string;

    @HasMany(() => AthleteEntity, { onDelete: 'CASCADE' })
    athletes: AthleteEntity[];

    @HasMany(() => ClubEntity, { onDelete: 'CASCADE' })
    clubs: ClubEntity[];
}
