import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from '../user/user.service';
import { compare, genSalt, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IJWTAccessPayload } from '../../libs/interface/jwt/jwt-access-payload.interface';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { IJWTRefreshPayload } from '../../libs/interface/jwt/jwt-refresh-payload.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';
import { CodeRepository } from './repository/code.repository';
import { Sequelize } from 'sequelize-typescript';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Op } from 'sequelize';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ClubService } from '../club/club.service';
import { RequestAccountDeleteDto } from './dto/request-account-delete.dto';
import { EUserStatus } from '../../libs/enum/user-status.enum';
import { buildWhitelabelEmailUtil } from '../../libs/util/build-whitelabel-email.util';
import { WhiteLabelEntity } from '../club/entities/white-label.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly sequelize: Sequelize,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly postmarkService: PostmarkService,
        private readonly codeRepository: CodeRepository,
        private readonly clubService: ClubService,
    ) {}

    async signUp(payload: SignUpDto) {
        const userSafe = await this.userService.findOneByEmailSafe(payload.email);

        if (userSafe?.clubId && userSafe.status === EUserStatus.INVITED) {
            const salt = await genSalt();
            const passHashed = await hash(payload.password, salt);

            await this.userService.updateInternal(userSafe.id, {
                password: passHashed,
                role: payload.role,
                fullName: payload.fullName,
            });

            const userUpdated = await this.userService.findOneByEmailSafe(payload.email);
            const tokens = await this.signIn(userUpdated);
            const club = await this.clubService.findOne(userUpdated.clubId);

            return { ...tokens, invitationData: { club } };
        }

        if (userSafe) {
            throw new BadRequestException('User with such email already exists');
        }

        const userNew = await this.userService.create(payload);
        const userSafeNew = await this.userService.findOneByEmailSafe(userNew.email);

        return this.signIn(userSafeNew);
    }

    async signIn(user: UserEntity) {
        const accessToken = this.getJwtAccessToken(user.id, user.role);
        const refreshToken = this.getJwtRefreshToken(user.id);

        await this.userService.setRefreshToken(user.id, refreshToken);

        return { user, accessToken, refreshToken };
    }

    async logOut(user: UserEntity) {
        await this.userService.removeRefreshToken(user.id);

        return { success: true };
    }

    async me(user: UserEntity) {
        return await this.userService.findMe(user.id);
    }

    refresh(user: UserEntity) {
        const accessToken = this.getJwtAccessToken(user.id, user.role);

        return { accessToken };
    }

    async getAuthenticatedUser(email: string, password: string): Promise<UserEntity | null> {
        email = email?.trim();

        const user = await this.userService.findOneByEmailInternal(email);

        if (!user?.password) {
            throw new BadRequestException('User with such credentials not found');
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('User with such credentials not found');
        }

        return this.userService.findOne(user.id);
    }

    async forgotPassword(payload: ForgotPasswordDto) {
        return await this.sequelize.transaction(async (transaction) => {
            payload.email = payload.email?.trim();

            const user = await this.userService.findOneByEmailSafe(payload.email, transaction);

            if (!user) {
                return { success: true };
            }

            const code = Math.floor(Math.random() * 899999 + 100000).toString();

            await this.codeRepository.delete({ where: { userId: user.id }, transaction });

            const salt = await genSalt();
            const codeHashed = await hash(code, salt);

            await this.codeRepository.create({ code: codeHashed, userId: user.id }, { transaction });

            let wl: WhiteLabelEntity | null = null;
            let clubLogoUrl: string;
            let isClubSubscribed: boolean;

            if (user.role === EUserRole.ATHLETE || user.role === EUserRole.CLUB) {
                const userWithWL = await this.userService.findOneWithWL(user.id, transaction);
                const club = EUserRole.ATHLETE ? userWithWL?.athlete?.club : userWithWL?.club;

                if (club?.isSubscriptionActive) {
                    wl = club?.whiteLabel;
                    clubLogoUrl = club?.file?.url;
                    isClubSubscribed = club?.isSubscriptionActive;
                }
            }

            const whiteLabeling = buildWhitelabelEmailUtil(wl, clubLogoUrl, isClubSubscribed);

            await this.postmarkService.sendPasswordResetCodeEmail(payload.email, {
                code,
                fullName: user.fullName,
                ...whiteLabeling,
            });

            return { success: true };
        });
    }

    async resetPassword(payload: ResetPasswordDto) {
        payload.email = payload.email?.trim();

        const user = await this.userService.findOneByEmailSafe(payload.email);

        if (!user) {
            throw new NotFoundException();
        }

        const tryFindCode = await this.codeRepository.findOneByOptions({
            where: { createdAt: { [Op.gte]: Date.now() - 10 * 60 * 1000 }, userId: user.id },
            order: [['createdAt', 'DESC']],
        });

        if (!tryFindCode) {
            throw new BadRequestException();
        }

        const isCodeValid = await compare(payload.code, tryFindCode.code);

        if (!isCodeValid) {
            throw new BadRequestException();
        }

        const salt = await genSalt();
        const passHashed = await hash(payload.password, salt);

        await this.userService.updateInternal(user.id, { password: passHashed });
        await this.codeRepository.delete({ where: { id: tryFindCode.id } });

        return this.signIn(user);
    }

    async changePassword(payload: ChangePasswordDto, user: UserEntity) {
        const userPrivate = await this.userService.findOneByEmailInternal(user.email);
        const isPassValid = await compare(payload.oldPassword, userPrivate.password);

        if (!isPassValid) {
            throw new BadRequestException(`Old password is incorrect`);
        }

        const salt = await genSalt();
        const passHashed = await hash(payload.password, salt);

        await this.userService.updateInternal(user.id, { password: passHashed });

        return this.signIn(user);
    }

    async requestAccountDelete(payload: RequestAccountDeleteDto) {
        const userWithWL = await this.userService.findOneWithWL(payload.email);
        const club = EUserRole.ATHLETE ? userWithWL?.athlete?.club : userWithWL?.club;
        let wl: WhiteLabelEntity | null = null;
        let clubLogoUrl: string;
        let isClubSubscribed: boolean;

        if (club?.isSubscriptionActive) {
            wl = club?.whiteLabel;
            clubLogoUrl = club?.file?.url;
            isClubSubscribed = club?.isSubscriptionActive;
        }

        const whiteLabeling = buildWhitelabelEmailUtil(wl, clubLogoUrl, isClubSubscribed);

        await this.postmarkService.requestAccountDelete(payload.to, { email: payload.email, ...whiteLabeling });

        return { success: true };
    }

    private getJwtAccessToken(id: number, role: EUserRole): string {
        const payload: IJWTAccessPayload = { id, role };

        return this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        });
    }

    public getJwtRefreshToken(id: number): string {
        const payload: IJWTRefreshPayload = { id };

        return this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
        });
    }
}
