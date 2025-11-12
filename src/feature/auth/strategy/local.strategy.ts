import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';
import { AuthLocalStrategy } from '../../../libs/const/auth-guard-name.const';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AuthLocalStrategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            role: 'role',
        });
    }

    async validate(email: string, password: string): Promise<UserEntity> {
        return await this.authService.getAuthenticatedUser(email, password);
    }
}
