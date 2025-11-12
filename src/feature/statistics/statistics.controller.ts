import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { ApiTags } from '@nestjs/swagger';
import { FindStatisticsDto } from './dto/find-statistics.dto';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import { IsPublic } from '../../libs/decorator/is-public.decorator';
import { ThisUser } from '../../libs/decorator/this-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { RolesGuard } from '../../libs/guard/role.guard';
import { Roles } from '../../libs/decorator/role.decorator';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { FindAdminStatisticsDto } from './dto/find-admin-statistics.dto';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Post()
    create(@Body() payload: CreateStatisticDto) {
        return this.statisticsService.create(payload);
    }

    @UseGuards(JwtAccessGuard)
    @IsPublic()
    @Get()
    findAll(@Query() query: FindStatisticsDto, @ThisUser() user: UserEntity) {
        return this.statisticsService.findAll(query, user);
    }

    @UseGuards(JwtAccessGuard, RolesGuard)
    @Roles(EUserRole.ADMIN)
    @Get('admin')
    findAllForAdmin(@Query() query: FindAdminStatisticsDto) {
        return this.statisticsService.findAllForAdmin(query);
    }

    @UseGuards(JwtAccessGuard)
    @Get('athlete')
    findOne(@Query() query: FindStatisticsDto, @ThisUser() user: UserEntity) {
        return this.statisticsService.finsOneByAthlete(query, user);
    }
}
