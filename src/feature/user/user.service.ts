import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { compare, genSalt, hash } from 'bcrypt';
import { clubDefaultInfo, userPublicInfo } from '../../libs/const/scope.const';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { AthleteEntity } from '../athlete/entities/athlete.entity';
import { ClubEntity } from '../club/entities/club.entity';
import { Transaction, WhereOptions } from 'sequelize';
import { InviteDto } from '../athlete/dto/invite.dto';
import { PhotoEntity } from '../photo/entity/photo.entity';
import { WhiteLabelEntity } from '../club/entities/white-label.entity';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(payload: CreateUserDto) {
        const salt = await genSalt();
        const passwordHashed = await hash(payload.password, salt);

        return await this.userRepository.create({ ...payload, password: passwordHashed });
    }

    async createInvitedUser(payload: InviteDto, transaction?: Transaction) {
        const isExists = await this.userRepository.count({
            where: { email: payload.email.toLowerCase() },
            transaction,
        });

        if (isExists) {
            throw new BadRequestException('User with such email already exists');
        }

        return await this.userRepository.create({ ...payload, role: EUserRole.ATHLETE }, { transaction });
    }

    findOne(id: number): Promise<UserEntity> {
        return this.userRepository.findById(id, { include: [ClubEntity] }, userPublicInfo);
    }

    findMe(id: number): Promise<UserEntity> {
        return this.userRepository.findById(
            id,
            {
                include: [
                    {
                        model: AthleteEntity,
                        include: [
                            { model: PhotoEntity, attributes: ['id', 'url'] },
                            { model: ClubEntity.scope(clubDefaultInfo) },
                        ],
                    },
                    { model: ClubEntity.scope(clubDefaultInfo) },
                ],
            },
            userPublicInfo,
        );
    }

    async update(id: number, updateUserDto: UpdateUserDto, user: UserEntity, transaction?: Transaction) {
        if (id !== user.id && user.role === EUserRole.ATHLETE) {
            throw new ForbiddenException();
        }

        await this.checkIfExistsAndThrow(id);

        delete updateUserDto.password;
        delete updateUserDto.refreshToken;
        delete updateUserDto.role;
        delete updateUserDto.status;
        delete updateUserDto.athleteId;
        delete updateUserDto.clubId;

        await this.userRepository.update({ where: { id }, transaction }, updateUserDto);

        return { success: true };
    }

    updateInternal(id: number, updateUserDto: UpdateUserDto, transaction?: Transaction) {
        return this.userRepository.update({ where: { id }, transaction }, updateUserDto);
    }

    async remove(id: number, user: UserEntity) {
        if (id !== user.id && user.role !== EUserRole.ADMIN) {
            throw new ForbiddenException();
        }

        await this.checkIfExistsAndThrow(id);
        await this.userRepository.delete({ where: { id } });

        return { success: true };
    }

    async findOneByRefresh(refreshToken: string, id: number): Promise<UserEntity | null> {
        const user = await this.userRepository.findById(id);

        if (!user?.refreshToken) {
            return null;
        }

        const isRefreshTokenMatching = await compare(refreshToken, user.refreshToken);

        return isRefreshTokenMatching ? user : null;
    }

    findOneByEmailInternal(email: string, transaction?: Transaction): Promise<UserEntity | null> {
        return this.userRepository.findOneByOptions({ where: { email: email.toLowerCase() }, transaction });
    }

    findOneByEmailSafe(email: string, transaction?: Transaction): Promise<UserEntity | null> {
        return this.userRepository.findOneByOptions(
            { where: { email: email.toLowerCase() }, transaction },
            userPublicInfo,
        );
    }

    findOneWithWL(id: number | string, transaction?: Transaction): Promise<UserEntity | null> {
        const where: WhereOptions = {};

        if (typeof id === 'number') {
            where.id = id;
        } else {
            where.email = id;
        }

        return this.userRepository.findOneByOptions(
            {
                where,
                include: [
                    { model: AthleteEntity, include: [{ model: ClubEntity, include: [WhiteLabelEntity] }] },
                    { model: ClubEntity.scope(clubDefaultInfo) },
                ],
                transaction,
            },
            userPublicInfo,
        );
    }

    async setRefreshToken(id: number, refreshToken: string): Promise<void> {
        const salt = await genSalt();
        const hashedRefreshToken = await hash(refreshToken, salt);

        await this.userRepository.update({ where: { id } }, { refreshToken: hashedRefreshToken });
    }

    async removeRefreshToken(id: number): Promise<void> {
        await this.userRepository.update({ where: { id } }, { refreshToken: null });
    }

    async checkIfExistsAndThrow(id: number, transaction?: Transaction) {
        const isExists = await this.userRepository.count({ where: { id }, transaction });

        if (!isExists) {
            throw new BadRequestException('User not found');
        }
    }

    async checkIfExistsByEmail(email: string, transaction?: Transaction) {
        return await this.userRepository.count({ where: { email: email.toLowerCase() }, transaction });
    }
}
