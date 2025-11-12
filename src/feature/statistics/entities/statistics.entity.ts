import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { AthleteEntity } from '../../athlete/entities/athlete.entity';
import { StatTypeEnum } from '../enum/stat-type.enum';
import { CoachEntity } from '../../coach/entities/coach.entity';

@Table({ tableName: 'statistics', freezeTableName: true, timestamps: true })
export class StatisticsEntity extends Model<StatisticsEntity> {
    @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.ENUM(...Object.values(StatTypeEnum)), allowNull: false })
    type: StatTypeEnum;

    @Column({ type: DataType.BOOLEAN, allowNull: true, field: 'is_interested' })
    isInterested: boolean;

    @ForeignKey(() => AthleteEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'athlete_id' })
    athleteId: number;

    @BelongsTo(() => AthleteEntity, { onDelete: 'CASCADE' })
    athlete: AthleteEntity;

    @ForeignKey(() => CoachEntity)
    @Column({ type: DataType.INTEGER, allowNull: true, field: 'coach_id' })
    coachId: number;

    @BelongsTo(() => CoachEntity, { onDelete: 'CASCADE' })
    coach: CoachEntity;
}
