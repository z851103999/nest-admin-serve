import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  MulterFile,
} from '@webundsoehne/nest-fastify-file-upload';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('文件上传')
@Controller('common')
export class UploadController {
  /* 单文件上传 */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Query('fileName') fileName,
  ) {
    return {
      fileName,
      originalname: file.originalname,
      mimetype: file.mimetype,
    };
  }

  /* 数组文件上传 */
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFils(@UploadedFiles() files: Array<MulterFile>) {
    /* 暂未处理 */
    return files;
  }
}
