import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClubService } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import { Roles } from '../../libs/decorator/role.decorator';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { ThisUser } from '../../libs/decorator/this-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { RolesGuard } from '../../libs/guard/role.guard';
import { UpdateWhiteLabelDto } from './dto/update-white-label.dto';
import { QueryClubDto } from './dto/query-club.dto';

@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@ApiTags('Club')
@Controller('club')
export class ClubController {
    constructor(private readonly clubService: ClubService) {}

    @Roles(EUserRole.CLUB)
    @Post()
    create(@Body() createClubDto: CreateClubDto, @ThisUser() user: UserEntity) {
        return this.clubService.create(createClubDto, user);
    }

    @Roles(EUserRole.CLUB)
    @Post('validate-payment')
    validatePayment(@ThisUser() user: UserEntity) {
        return this.clubService.validatePayment(user);
    }

    @Roles(EUserRole.CLUB)
    @Patch('white-label')
    updateWhiteLabel(@Body() payload: UpdateWhiteLabelDto, @ThisUser() user: UserEntity) {
        return this.clubService.updateWhiteLabel(payload, user);
    }

    @Roles(EUserRole.CLUB, EUserRole.ADMIN)
    @Get()
    findAll(@Query() query: QueryClubDto) {
        return this.clubService.findAll(query);
    }

    @Roles(EUserRole.CLUB, EUserRole.ADMIN)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clubService.findOne(+id);
    }

    @Roles(EUserRole.CLUB, EUserRole.ADMIN)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClubDto: UpdateClubDto, @ThisUser() user: UserEntity) {
        return this.clubService.update(+id, updateClubDto, user);
    }

    @ApiOperation({ deprecated: true })
    @Roles(EUserRole.CLUB)
    @Delete(':id')
    remove(@Param('id') id: string, @ThisUser() user: UserEntity) {
        return this.clubService.remove(+id, user);
    }
}
