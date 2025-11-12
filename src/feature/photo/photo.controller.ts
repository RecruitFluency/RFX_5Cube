import {
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Post,
    Res,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import JwtAccessGuard from '../../libs/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { Response } from 'express';
import { FileUploadDto } from './file-upload.dto';

@ApiTags('Photo')
@Controller('photo')
export class PhotoController {
    constructor(private readonly photoService: PhotoService) {}

    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: FileUploadDto })
    @UseGuards(JwtAccessGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post()
    upload(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({ maxSize: 5_242_880 })
                .addFileTypeValidator({ fileType: '.(jpeg|jpg|png|tiff|svg|webp)' })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
    ) {
        return this.photoService.upload(file);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
        const photo = await this.photoService.findOne(+id);
        const stream = Readable.from(photo.file);

        response.set({
            'Content-Disposition': `inline; filename="${photo.fileName}"`,
            'Content-Type': 'image',
        });

        return new StreamableFile(stream);
    }
}
