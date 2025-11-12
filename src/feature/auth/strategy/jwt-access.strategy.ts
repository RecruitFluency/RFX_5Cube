import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IJWTAccessPayload } from '../../../libs/interface/jwt/jwt-access-payload.interface';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { AuthAccessStrategy } from '../../../libs/const/auth-guard-name.const';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, AuthAccessStrategy) {
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
            secretOrKey: _configService.get('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: IJWTAccessPayload): Promise<UserEntity> {
        return this.userService.findOne(payload.id);
    }
}
