import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AthleteService } from './athlete.service';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { ThisUser } from '../../libs/decorator/this-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import { Roles } from '../../libs/decorator/role.decorator';
import { QueryAthlete } from './dto/query-athlete.dto';
import { InviteDto } from './dto/invite.dto';
import { InviteFollowUpDto } from './dto/invite-follow-up.dto';
import { QueryPublicAthleteDto } from './dto/query-public-athlete.dto';
import { IsPublic } from '../../libs/decorator/is-public.decorator';
import { RolesGuard } from '../../libs/guard/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../photo/file-upload.dto';
import { AttachClubDto } from './dto/attach-club.dto';

@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@ApiTags('Athlete')
@Controller('athlete')
export class AthleteController {
    constructor(private readonly athleteService: AthleteService) {}

    @Roles(EUserRole.ATHLETE)
    @Post()
    create(@Body() createAthleteDto: CreateAthleteDto, @ThisUser() user: UserEntity) {
        return this.athleteService.create(createAthleteDto, user);
    }

    @Roles(EUserRole.ATHLETE)
    @Post('validate-payment')
    validatePayment(@ThisUser() user: UserEntity) {
        return this.athleteService.validatePayment(user);
    }

    @Roles(EUserRole.CLUB)
    @Post('invite')
    inviteAthlete(@Body() payload: InviteDto, @ThisUser() user: UserEntity) {
        return this.athleteService.inviteAthlete(payload, user);
    }

    @Roles(EUserRole.ATHLETE, EUserRole.CLUB)
    @Patch('invite/follow-up')
    keepInvitation(@Body() payload: InviteFollowUpDto, @ThisUser() user: UserEntity) {
        return this.athleteService.keepInvitation(payload, user);
    }

    @Roles(EUserRole.ADMIN, EUserRole.CLUB)
    @Get()
    findAll(@Query() query: QueryAthlete, @ThisUser() user: UserEntity) {
        return this.athleteService.findAll(query, user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.athleteService.findOne(+id);
    }

    @IsPublic()
    @Get(':id/public')
    findOnePublic(@Param('id') id: string, @Query() query: QueryPublicAthleteDto) {
        return this.athleteService.findOnePublic(+id, query);
    }

    @Roles(EUserRole.ATHLETE)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAthleteDto: UpdateAthleteDto, @ThisUser() user: UserEntity) {
        return this.athleteService.update(+id, updateAthleteDto, user);
    }

    @Roles(EUserRole.ADMIN)
    @Patch(':id/club')
    attachClub(@Param('id') id: string, @Body() updateAthleteDto: AttachClubDto) {
        return this.athleteService.attachClub(+id, updateAthleteDto);
    }

    @ApiOperation({ deprecated: true })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.athleteService.remove(+id);
    }

    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: FileUploadDto })
    @Roles(EUserRole.CLUB)
    @Post('bulk-upload')
    bulkUpload(
        @UploadedFile(
            new ParseFilePipeBuilder()
                // .addMaxSizeValidator({ maxSize: 5_242_880 })
                .addFileTypeValidator({ fileType: '.(csv)' })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
        @ThisUser() user: UserEntity,
    ) {
        return this.athleteService.bulkUpload(file, user);
    }
}
