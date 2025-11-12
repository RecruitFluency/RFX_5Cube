import { Column, DataType, ForeignKey, HasOne, Model, Scopes, Table } from 'sequelize-typescript';
import { EUserRole } from '../../../libs/enum/user-role.enum';
import { userPublicInfo } from '../../../libs/const/scope.const';
import { AthleteEntity } from '../../athlete/entities/athlete.entity';
import { ClubEntity } from '../../club/entities/club.entity';
import { EUserStatus } from '../../../libs/enum/user-status.enum';

@Scopes(() => ({
    [userPublicInfo]: {
        attributes: { exclude: ['password', 'refreshToken'] },
    },
}))
@Table({ timestamps: true, tableName: 'user', freezeTableName: true })
export class UserEntity extends Model<UserEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: true })
    fullName: string;

    @Column({ type: DataType.STRING, allowNull: false })
    email: string;

    @Column({ type: DataType.STRING, allowNull: true })
    password: string;

    @Column({ type: DataType.ENUM(...Object.values(EUserRole)), allowNull: false })
    role: EUserRole;

    @Column({ type: DataType.ENUM(...Object.values(EUserStatus)), allowNull: false, defaultValue: EUserStatus.ACTIVE })
    status: EUserStatus;

    @Column({ type: DataType.STRING, allowNull: true })
    refreshToken: string;

    @ForeignKey(() => AthleteEntity)
    @Column({ type: DataType.INTEGER, allowNull: true })
    athleteId: number;

    @HasOne(() => AthleteEntity, { onDelete: 'SET NULL' })
    athlete: AthleteEntity;

    @ForeignKey(() => ClubEntity)
    @Column({ type: DataType.INTEGER, allowNull: true })
    clubId: number;

    @HasOne(() => ClubEntity, { onDelete: 'SET NULL' })
    club: ClubEntity;
}
