import { Model } from 'sequelize-typescript';
import { CreationAttributes, DestroyOptions, FindOptions, Transaction, UpdateOptions } from 'sequelize';

export interface IRepository<M extends Model> {
    create(model: CreationAttributes<M>, transaction?: { transaction: Transaction }): Promise<M>;
    update(criteria: UpdateOptions<M>, model: Partial<M>): Promise<[affectedCount: number]>;
    findById(id: string, options?: Omit<FindOptions<M>, 'where'>, scope?: string): Promise<M>;
    findOneByOptions(options: FindOptions<M>, scope?: string): Promise<M>;
    findAllByOptions(options: FindOptions<M>, scope?: string): Promise<M[]>;
    delete(criteria: DestroyOptions<M>): Promise<number>;
}
