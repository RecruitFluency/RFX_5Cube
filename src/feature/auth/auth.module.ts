import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PostmarkService } from '../../libs/module/postmark/postmark.service';
import { CodeRepository } from './repository/code.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { CodeEntity } from './entity/code.entity';
import { ClubModule } from '../club/club.module';

@Module({
    imports: [UserModule, JwtModule.register({}), PassportModule, SequelizeModule.forFeature([CodeEntity]), ClubModule],
    controllers: [AuthController],
    providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy, LocalStrategy, PostmarkService, CodeRepository],
})
export class AuthModule {}
