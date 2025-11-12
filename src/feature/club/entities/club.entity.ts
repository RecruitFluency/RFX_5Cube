import { BelongsTo, Column, DataType, ForeignKey, Model, Scopes, Table } from 'sequelize-typescript';
import { UserEntity } from '../../user/entities/user.entity';
import { PhotoEntity } from '../../photo/entity/photo.entity';
import { WhiteLabelEntity } from './white-label.entity';
import { clubDefaultInfo, photoDefaultInfo } from '../../../libs/const/scope.const';

@Scopes(() => ({
    [clubDefaultInfo]: {
        include: [{ model: PhotoEntity.scope(photoDefaultInfo) }, { model: WhiteLabelEntity }],
    },
}))
@Table({ tableName: 'club', timestamps: true, freezeTableName: true })
export class ClubEntity extends Model<ClubEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.STRING, allowNull: true })
    league: string;

    @Column({ type: DataType.STRING, allowNull: false })
    city: string;

    @Column({ type: DataType.STRING, allowNull: true })
    state: string;

    @Column({ type: DataType.STRING, allowNull: false })
    country: string;

    @Column({ type: DataType.STRING, allowNull: false })
    admin: string;

    @Column({ type: DataType.STRING, allowNull: true, field: 'customer_id' })
    customerId: string;

    @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_subscription_active' })
    isSubscriptionActive: boolean;

    @Column({ type: DataType.INTEGER, allowNull: true, field: 'foundation_year' })
    foundationYear: number;

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

    @ForeignKey(() => WhiteLabelEntity)
    @Column({ type: DataType.INTEGER, allowNull: false, field: 'white_label_id' })
    whiteLabelId: number;

    @BelongsTo(() => WhiteLabelEntity, { onDelete: 'SET NULL' })
    whiteLabel: WhiteLabelEntity;
}
