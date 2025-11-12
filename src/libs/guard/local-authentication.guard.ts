import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthLocalStrategy } from '../const/auth-guard-name.const';

@Injectable()
export class LocalAuthenticationGuard extends AuthGuard(AuthLocalStrategy) {}
