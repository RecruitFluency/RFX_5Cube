import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Scopes, Table } from 'sequelize-typescript';
import { EAthleteType } from '../enum/athlete-type.enum';
import { ESportType } from '../enum/sport-type.enum';
import { EPositionType } from '../enum/position-type.enum';
import { EFootType } from '../enum/foot-type.enum';
import { UserEntity } from '../../user/entities/user.entity';
import { EFinance } from '../enum/finance.enum';
import { financeConfig } from '../../../libs/const/finance-config.const';
import { athleteDefaultInfo, photoDefaultInfo } from '../../../libs/const/scope.const';
import { CoachToAthleteEntity } from '../../coach/entities/coach-to-athlete.entity';
import { ClubEntity } from '../../club/entities/club.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';
import { StatisticsEntity } from '../../statistics/entities/statistics.entity';
import { GenderEnum } from '../../../libs/enum/gender.enum';

@Scopes(() => ({
    [athleteDefaultInfo]: {
        include: [
            { model: PhotoEntity.scope(photoDefaultInfo) },
            { model: UserEntity, attributes: ['fullName', 'email'] },
            { model: ClubEntity },
        ],
    },
}))
@Table({ tableName: 'athlete', timestamps: true, freezeTableName: true })
export class AthleteEntity extends Model<AthleteEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true })
    id: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    graduationYear: number;

    @Column({ type: DataType.DATE, allowNull: true })
    dateOfBirth: Date;

    @Column({ type: DataType.ENUM(...Object.values(EAthleteType)), allowNull: true })
    type: EAthleteType;

    @Column({ type: DataType.STRING, allowNull: true })
    city: string;

    @Column({ type: DataType.STRING, allowNull: true })
    state: string;

    @Column({ type: DataType.STRING, allowNull: true })
    country: string;

    @Column({ type: DataType.STRING, allowNull: true })
    phone: string;

    @Column({ type: DataType.STRING, allowNull: true })
    userNameX: string;

    @Column({ type: DataType.STRING, allowNull: true })
    userNameYoutube: string;

    @Column({ type: DataType.STRING, allowNull: true })
    userNameInstagram: string;

    @Column({ type: DataType.STRING, allowNull: true })
    leagueName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    clubName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    coachName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    coachEmail: string;

    @Column({ type: DataType.ENUM(...Object.values(ESportType)), allowNull: true })
    sportType: ESportType;

    @Column({ type: DataType.ENUM(...Object.values(EPositionType)), allowNull: true })
    primaryPosition: EPositionType;

    @Column({ type: DataType.ENUM(...Object.values(EPositionType)), allowNull: true })
    secondaryPosition: EPositionType;

    @Column({ type: DataType.INTEGER, allowNull: true })
    heightFt: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    heightIn: number;

    @Column({ type: DataType.DECIMAL, allowNull: true })
    weightLbs: number;

    @Column({ type: DataType.ENUM(...Object.values(EFootType)), allowNull: true })
    dominantFoot: EFootType;

    @Column({ type: DataType.DECIMAL, allowNull: true })
    oneMileTime: number;

    @Column({ type: DataType.DECIMAL, allowNull: true })
    twoMileTime: number;

    @Column({ type: DataType.DECIMAL, allowNull: true })
    fortyYardDashTime: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    act: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    sat: number;

    @Column({ type: DataType.STRING, allowNull: true })
    gpa: string;

    @Column({ type: DataType.STRING, allowNull: true })
    weightedGpa: string;

    @Column({ type: DataType.INTEGER, allowNull: true })
    ncaa: number;

    @Column({ type: DataType.INTEGER, allowNull: true })
    naia: number;

    @Column({ type: DataType.STRING, allowNull: true })
    classRank: string;

    @Column({ type: DataType.STRING, allowNull: true })
    plannedFieldOfStudy: string;

    @Column({ type: DataType.ENUM(...Object.values(EFinance)), allowNull: true })
    finance: EFinance;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    isLeadershipPosition: boolean;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    isNewClub: boolean;

    @Column({ type: DataType.STRING, allowNull: true })
    youtubeLink: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
    isStatsExposed: boolean;

    @Column({ type: DataType.STRING, allowNull: true, field: 'customer_id' })
    customerId: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_subscription_active' })
    isSubscriptionActive: boolean;

    @Column({ type: DataType.ENUM(...Object.values(GenderEnum)), allowNull: false, defaultValue: GenderEnum.MALE })
    gender: GenderEnum;

    @Column({ type: DataType.STRING(2), allowNull: true, field: 'jersey_number' })
    jerseyNumber: string;

    @ForeignKey(() => UserEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @BelongsTo(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity;

    @ForeignKey(() => PhotoEntity)
    @Column({ type: DataType.INTEGER, allowNull: true })
    fileId: number;

    @BelongsTo(() => PhotoEntity, { onDelete: 'SET NULL' })
    file: PhotoEntity;

    @ForeignKey(() => ClubEntity)
    @Column({ type: DataType.INTEGER, allowNull: true })
    clubId: number;

    @BelongsTo(() => ClubEntity, { onDelete: 'SET NULL' })
    club: ClubEntity;

    @HasMany(() => CoachToAthleteEntity)
    coachToAthletes: CoachToAthleteEntity[];

    @HasMany(() => StatisticsEntity)
    statistics: StatisticsEntity[];

    @Column({
        type: DataType.VIRTUAL,
        get() {
            const data: EFinance = this.getDataValue('finance');

            return financeConfig[data]?.min || null;
        },
    })
    minFinance: number;

    @Column({
        type: DataType.VIRTUAL,
        get() {
            const data: EFinance = this.getDataValue('finance');

            return financeConfig[data]?.max || null;
        },
    })
    maxFinance: number;
}
