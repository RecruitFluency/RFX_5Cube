import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    HttpStatus,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { CoachService } from './service/coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import { Roles } from '../../libs/decorator/role.decorator';
import { EUserRole } from '../../libs/enum/user-role.enum';
import { CoachToAthleteService } from './service/coach-to-athlete.service';
import { RolesGuard } from '../../libs/guard/role.guard';
import { QueryCoachDto } from './dto/query-coach.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../photo/file-upload.dto';
import { QueryEmailsDto } from './dto/query-emails.dto';
import { Response } from 'express';
import { Readable } from 'stream';
import { DownloadCoachDto } from './dto/download-coach.dto';

@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(EUserRole.ADMIN)
@ApiTags('Coach')
@Controller('coach')
export class CoachController {
    constructor(
        private readonly coachService: CoachService,
        private readonly coachToAthleteService: CoachToAthleteService,
    ) {}

    @Post()
    create(@Body() createCoachDto: CreateCoachDto) {
        return this.coachService.create(createCoachDto);
    }

    @Get('csv-template')
    async getCsvTemplate(@Res({ passthrough: true }) response: Response) {
        const csv = await this.coachService.getCsvTemplate();
        const stream = Readable.from(csv);

        response.set({
            'Content-Disposition': `inline; filename="Formatting example.csv"`,
            'Content-Type': 'csv',
        });

        return new StreamableFile(stream);
    }

    @Get('emails')
    emails(@Query() query: QueryEmailsDto) {
        return this.coachToAthleteService.findAll(query);
    }

    @Get()
    findAll(@Query() query: QueryCoachDto) {
        return this.coachService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coachService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCoachDto: UpdateCoachDto) {
        return this.coachService.update(+id, updateCoachDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coachService.remove(+id);
    }

    @ApiOperation({ deprecated: true })
    @Post('test')
    test() {
        return { deprecated: true };
        // return this.coachToAthleteService.main();
    }

    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({ type: FileUploadDto })
    @Post('bulk-upload')
    bulkUpload(
        @UploadedFile(
            new ParseFilePipeBuilder()
                // .addMaxSizeValidator({ maxSize: 5_242_880 })
                .addFileTypeValidator({ fileType: '.csv' })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
    ) {
        return this.coachService.bulkUpload(file);
    }

    @Post('download')
    download(@Body() payload: DownloadCoachDto, @Res({ passthrough: true }) response: Response) {
        return this.coachService.download(payload, response);
    }
}
