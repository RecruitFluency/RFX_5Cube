import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ClubRepository } from './repository/club.repository';
import { UserEntity } from '../user/entities/user.entity';
import { WhiteLabelRepository } from './repository/white-label.repository';
import { clubDefaultInfo } from '../../libs/const/scope.const';
import { UpdateWhiteLabelDto } from './dto/update-white-label.dto';
import { UserService } from '../user/user.service';
import { QueryClubDto } from './dto/query-club.dto';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { ClubEntity } from './entities/club.entity';
import { RevenueCatService } from '../../libs/module/revenue-cat/revenue-cat.service';
import { Sequelize } from 'sequelize-typescript';
import { PhotoService } from '../photo/photo.service';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { UpdateAthleteDto } from '../athlete/dto/update-athlete.dto';

@Injectable()
export class ClubService {
    constructor(
        private readonly sequelize: Sequelize,
        private readonly clubRepository: ClubRepository,
        private readonly whiteLabelRepository: WhiteLabelRepository,
        private readonly userService: UserService,
        private readonly revenueCatService: RevenueCatService,
        private readonly photoService: PhotoService,
    ) {}

    async create(payload: CreateClubDto, user: UserEntity) {
        return this.sequelize.transaction(async (transaction) => {
            const isClubExists = await this.clubRepository.findOneByOptions({
                where: { userId: user.id },
                transaction,
            });

            if (isClubExists) {
                throw new BadRequestException('Club profile for this user already exists');
            }

            if (typeof payload.fileId === 'number') {
                await this.photoService.checkIfExistsAndThrow(payload.fileId);
            }

            if (payload.customerId) {
                const isCustomerIdExists = await this.clubRepository.count({
                    where: { customerId: payload.customerId },
                    transaction,
                });

                if (isCustomerIdExists) {
                    throw new BadRequestException(`Customer id already exists`);
                }
            }

            const whiteLabel = await this.whiteLabelRepository.create({}, { transaction });
            const club = await this.clubRepository.create(
                { ...payload, userId: user.id, whiteLabelId: whiteLabel.id },
                { transaction },
            );

            await this.userService.updateInternal(user.id, { clubId: club.id }, transaction);

            return await this.findOne(club.id, transaction);
        });
    }

    async validatePayment(user: UserEntity) {
        const club = await this.clubRepository.findById(user.clubId);

        if (!club) {
            throw new BadRequestException(`User does not have club profile yet`);
        }

        if (!club.customerId) {
            throw new BadRequestException(`Club does not have customerId yet`);
        }

        const customer = await this.revenueCatService.getCustomer(club.customerId);

        if (!customer) {
            throw new NotFoundException("The club's customer id does not exist in revenue cat");
        }

        if (!customer.active_entitlements?.items?.length) {
            const entitlementFound = customer.active_entitlements.items.find(
                (item) => item.entitlement_id === RevenueCatService.entitlements.whiteLabeling.id,
            );

            if (entitlementFound) {
                const expiresAt = new Date(entitlementFound.expires_at);

                await this.clubRepository.update(
                    { where: { id: user.clubId } },
                    { isSubscriptionActive: expiresAt < new Date() },
                );

                return { success: true, isActive: expiresAt < new Date() };
            }

            return { success: true, isActive: false };
        }
    }

    async updateWhiteLabel(payload: UpdateWhiteLabelDto, user: UserEntity) {
        const club = await this.clubRepository.findById(user.clubId);

        Object.entries(payload).forEach(([key, value]: [string, string]) => {
            if (value) {
                payload[key] = value.startsWith('#') ? value.toUpperCase() : `#${value.toUpperCase()}`;
            }
        });

        await this.whiteLabelRepository.update({ where: { id: club.whiteLabelId } }, payload);

        return { success: true };
    }

    findAll(query: QueryClubDto) {
        const where: WhereOptions<ClubEntity> = {};

        if (query.q) {
            where.title = { [Op.iLike]: `%${query.q}%` };
        }

        if (typeof query.isActiveSubscription === 'boolean') {
            where.isSubscriptionActive = query.isActiveSubscription;
        }

        return this.clubRepository.findAllPaginated(
            query,
            {
                attributes: {
                    include: [
                        [
                            Sequelize.literal(
                                `(SELECT COUNT (*)
                                FROM athlete 
                                WHERE athlete."clubId"="ClubEntity".id
                                )`,
                            ),
                            'athletesCount',
                        ],
                    ],
                },
                where: where,
            },
            clubDefaultInfo,
        );
    }

    async findOne(id: number, transaction?: Transaction) {
        const club = await this.clubRepository.findById(
            id,
            {
                attributes: {
                    include: [
                        [
                            Sequelize.literal(
                                `(SELECT COUNT (*)
                                FROM athlete 
                                WHERE athlete."clubId"="ClubEntity".id
                                )`,
                            ),
                            'athletesCount',
                        ],
                    ],
                },
                transaction,
            },
            clubDefaultInfo,
        );

        if (!club) {
            throw new NotFoundException(`Club not found`);
        }

        return club;
    }

    async findByCustomerIds(customerIds: string[]) {
        return await this.clubRepository.findAllByOptions({ where: { customerId: { [Op.in]: customerIds } } });
    }

    async update(id: number, payload: UpdateClubDto, user: UserEntity) {
        if (id !== user.clubId && user.role !== EUserRole.ADMIN) {
            throw new ForbiddenException();
        }

        const club = await this.clubRepository.findById(id);

        if (!club) {
            throw new NotFoundException(`Club not found`);
        }

        delete payload.userId;

        if (typeof payload.fileId === 'number') {
            await this.photoService.checkIfExistsAndThrow(payload.fileId);
        }

        if (payload.customerId) {
            const isCustomerIdExists = await this.clubRepository.count({
                where: { customerId: payload.customerId, id: { [Op.ne]: id } },
            });

            if (isCustomerIdExists) {
                throw new BadRequestException(`Customer id already exists`);
            }
        }

        await this.clubRepository.update({ where: { id } }, payload);

        return { success: true };
    }

    async updateInternal(id: number, payload: UpdateClubDto) {
        return await this.clubRepository.update({ where: { id } }, payload);
    }

    async bulkUpdateInternal(ids: number[], payload: UpdateAthleteDto) {
        return await this.clubRepository.update({ where: { id: { [Op.in]: ids } } }, payload);
    }

    async remove(id: number, user: UserEntity) {
        const club = await this.clubRepository.findById(id);

        if (!club) {
            throw new NotFoundException(`Club not found`);
        }

        if (id !== user.id) {
            throw new ForbiddenException();
        }

        return this.clubRepository.delete({ where: { id } });
    }
}
