import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { CoachToAthleteEntity } from './coach-to-athlete.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';
import { DivisionEnum } from '../enum/division.enum';
import { GenderEnum } from '../../../libs/enum/gender.enum';

@Table({
    tableName: 'coach',
    timestamps: true,
    freezeTableName: true,
    indexes: [
        {
            type: 'UNIQUE',
            unique: true,
            fields: ['email', 'gender'],
        },
    ],
})
export class CoachEntity extends Model<CoachEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    email: string;

    @Column({ type: DataType.STRING, allowNull: true, field: 'full_name' })
    fullName: string;

    @Column({ type: DataType.ENUM(...Object.values(DivisionEnum)), allowNull: true })
    division: DivisionEnum;

    @Column({ type: DataType.STRING, allowNull: true })
    institute: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_deleted' })
    isDeleted: boolean;

    @Column({ type: DataType.ENUM(...Object.values(GenderEnum)), allowNull: false, defaultValue: GenderEnum.MALE })
    gender: GenderEnum;

    @Column({ type: DataType.STRING, allowNull: true })
    role: string;

    @Column({ type: DataType.STRING, allowNull: true })
    title: string;

    @ForeignKey(() => PhotoEntity)
    @Column({ type: DataType.INTEGER, allowNull: true, field: 'file_id' })
    fileId: number;

    @BelongsTo(() => PhotoEntity, { onDelete: 'SET NULL' })
    file: PhotoEntity;

    @HasMany(() => CoachToAthleteEntity)
    coachToAthletes: CoachToAthleteEntity[];
}
