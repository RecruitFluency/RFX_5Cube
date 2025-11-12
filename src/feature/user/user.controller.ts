import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { ThisUser } from '../../libs/decorator/this-user.decorator';
import { UserEntity } from './entities/user.entity';
import { Roles } from '../../libs/decorator/role.decorator';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../libs/guard/role.guard';

@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Roles(EUserRole.ADMIN, EUserRole.ATHLETE, EUserRole.CLUB)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @ThisUser() user: UserEntity) {
        return this.userService.update(+id, updateUserDto, user);
    }

    @Roles(EUserRole.ADMIN, EUserRole.ATHLETE, EUserRole.CLUB)
    @Delete(':id')
    remove(@Param('id') id: string, @ThisUser() user: UserEntity) {
        return this.userService.remove(+id, user);
    }
}
