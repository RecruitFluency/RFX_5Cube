import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { AthleteEntity } from '../../athlete/entities/athlete.entity';
import { CoachEntity } from './coach.entity';

@Table({ tableName: 'coach_to_athlete', timestamps: false, freezeTableName: true })
export class CoachToAthleteEntity extends Model<CoachToAthleteEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.DATE, allowNull: false })
    date: Date;

    @ForeignKey(() => AthleteEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    athleteId: number;

    @BelongsTo(() => AthleteEntity, { onDelete: 'CASCADE' })
    athlete: AthleteEntity;

    @ForeignKey(() => CoachEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    coachId: number;

    @BelongsTo(() => CoachEntity, { onDelete: 'CASCADE' })
    coach: CoachEntity;
}
