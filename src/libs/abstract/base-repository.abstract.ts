import { Model, ModelCtor } from 'sequelize-typescript';
import {
    CreationAttributes,
    DestroyOptions,
    FindOptions,
    Order,
    Transaction,
    UpdateOptions,
    UpsertOptions,
} from 'sequelize';
import { Attributes, BulkCreateOptions, CountOptions, FindAndCountOptions } from 'sequelize/types/model';
import { IRepository } from '../interface/repository.interface';
import { IBaseQuery } from '../interface/base/base-query.interface';
import { IBasePaginatedResponse } from '../interface/base/base-paginated-response.interface';
import { MakeNullishOptional } from 'sequelize/types/utils';

interface Pagination {
    offset: number;
    limit: number;
    order: Order;
}

export abstract class ABaseRepository<M extends Model> implements IRepository<M> {
    protected readonly model: ModelCtor<M> = null;
    protected readonly scope: string;

    protected constructor(model: ModelCtor<M>, defaultScope?: string) {
        this.model = model;
        this.scope = defaultScope;
    }

    async create(model: CreationAttributes<M>, transaction?: { transaction: Transaction }): Promise<M> {
        return this.model.create(model, transaction);
    }

    async bulkCreate(models: CreationAttributes<M>[], options?: BulkCreateOptions<Attributes<M>>): Promise<M[]> {
        return this.model.bulkCreate(models, options);
    }

    async upsert(
        criteria: UpsertOptions<Attributes<M>>,
        model: MakeNullishOptional<M['_creationAttributes']>,
        transaction?: Transaction,
    ): Promise<[M, boolean | null]> {
        return this.model.upsert(model, { ...criteria, transaction });
    }

    async findById(id: string | number, options?: Omit<FindOptions<M>, 'where'>, scope?: string): Promise<M> {
        return this.model.scope(this.scope || scope).findByPk(id, options);
    }

    async findOneByOptions(options: FindOptions<M>, scope?: string): Promise<M> {
        return this.model.scope(this.scope || scope).findOne(options);
    }

    async findAllByOptions(options?: FindOptions<M>, scope?: string): Promise<M[]> {
        return this.model.scope(this.scope || scope).findAll(options);
    }

    async findAllPaginated(
        query: IBaseQuery,
        options?: FindAndCountOptions<Attributes<M>>,
        scope?: string,
    ): Promise<IBasePaginatedResponse<M>> {
        const pagination = this.buildPagination(query);

        return this.model.scope(this.scope || scope).findAndCountAll({
            limit: pagination.limit,
            offset: pagination.offset,
            order: options?.order || pagination.order,
            ...options,
        });
    }

    async count(options: Omit<CountOptions<Attributes<M>>, 'group'>): Promise<number> {
        return this.model.count(options);
    }

    async update(criteria: UpdateOptions<M>, model: Partial<M>): Promise<[affectedCount: number]> {
        return this.model.update(model, criteria);
    }

    async delete(criteria: DestroyOptions<M>): Promise<number> {
        return this.model.destroy(criteria);
    }

    private buildPagination(query: IBaseQuery): Pagination {
        const offset = query.offset ? +query.offset : 0;
        const limit = query.limit ? +query.limit : 20;
        const sortBy = query.sort || 'createdAt';
        const sortOrder = +query.asc ? 'ASC' : 'DESC';
        const order: Order = [[sortBy, sortOrder]];

        return { offset, limit, order };
    }
}
