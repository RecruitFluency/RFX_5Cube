import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthRefreshStrategy } from '../const/auth-guard-name.const';

@Injectable()
export default class JwtRefreshGuard extends AuthGuard(AuthRefreshStrategy) {}
