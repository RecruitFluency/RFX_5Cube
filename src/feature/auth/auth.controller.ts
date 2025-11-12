import { Body, Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthenticationGuard } from '../../libs/guard/local-authentication.guard';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import JwtRefreshGuard from '../../libs/guard/jwt-refresh.guard';
import { ThisUser } from '../../libs/decorator/this-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RequestAccountDeleteDto } from './dto/request-account-delete.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-up')
    signUp(@Body() payload: SignUpDto) {
        return this.authService.signUp(payload);
    }

    @ApiBody({ type: SignInDto })
    @UseGuards(LocalAuthenticationGuard)
    @Post('sign-in')
    signIn(@ThisUser() user: UserEntity) {
        return this.authService.signIn(user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAccessGuard)
    @Patch('log-out')
    logOut(@ThisUser() user: UserEntity) {
        return this.authService.logOut(user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAccessGuard)
    @Get('me')
    me(@ThisUser() user: UserEntity) {
        return this.authService.me(user);
    }

    @ApiBearerAuth()
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refresh(@ThisUser() user: UserEntity) {
        return this.authService.refresh(user);
    }

    @Post('forgot-password')
    forgotPassword(@Body() payload: ForgotPasswordDto) {
        return this.authService.forgotPassword(payload);
    }

    @Post('reset-password')
    resetPassword(@Body() payload: ResetPasswordDto) {
        return this.authService.resetPassword(payload);
    }

    @Post('account/delete')
    requestAccountDelete(@Body() payload: RequestAccountDeleteDto) {
        return this.authService.requestAccountDelete(payload);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAccessGuard)
    @Put('change-password')
    changePassword(@Body() payload: ChangePasswordDto, @ThisUser() user: UserEntity) {
        return this.authService.changePassword(payload, user);
    }
}
