import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserEntity } from '../../user/entities/user.entity';
import { IJWTRefreshPayload } from '../../../libs/interface/jwt/jwt-refresh-payload.interface';
import { UserService } from '../../user/user.service';
import { AuthRefreshStrategy } from '../../../libs/const/auth-guard-name.const';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, AuthRefreshStrategy) {
    constructor(
        private readonly _configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request): string => {
                    return request?.header('Authorization')?.split(' ')[1];
                },
            ]),
            secretOrKey: _configService.get('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: IJWTRefreshPayload): Promise<UserEntity | null> {
        const refreshToken = request?.header('Authorization').split(' ')[1];

        return this.userService.findOneByRefresh(refreshToken, payload.id);
    }
}
