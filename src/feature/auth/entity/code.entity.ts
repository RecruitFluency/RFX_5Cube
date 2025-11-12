import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UserEntity } from '../../user/entities/user.entity';

@Table({ tableName: 'code', timestamps: true, freezeTableName: true })
export class CodeEntity extends Model<CodeEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    code: string;

    @ForeignKey(() => UserEntity)
    @Column({ type: DataType.INTEGER, allowNull: false })
    userId: number;

    @BelongsTo(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity;
}
