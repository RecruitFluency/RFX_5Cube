import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { whiteLabelDefaultConst } from '../../../libs/const/white-label-default.const';

@Table({ tableName: 'white_label', timestamps: true, freezeTableName: true })
export class WhiteLabelEntity extends Model<WhiteLabelEntity> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, unique: true })
    id: number;

    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        field: 'primary_color',
        defaultValue: whiteLabelDefaultConst.primaryColor,
    })
    primaryColor: string;

    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        field: 'accent_color',
        defaultValue: whiteLabelDefaultConst.accentColor,
    })
    accentColor: string;

    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        field: 'font_color',
        defaultValue: whiteLabelDefaultConst.fontColor,
    })
    fontColor: string;

    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        field: 'font_color_secondary',
        defaultValue: whiteLabelDefaultConst.fontColorSecondary,
    })
    fontColorSecondary: string;

    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        field: 'input_background_color',
        defaultValue: whiteLabelDefaultConst.inputBackgroundColor,
    })
    inputBackgroundColor: string;

    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        field: 'input_border_color',
        defaultValue: whiteLabelDefaultConst.inputBorderColor,
    })
    inputBorderColor: string;
}
