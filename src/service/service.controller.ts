import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ServiceService } from './service.service';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Service } from './entities/service.entity';
import { UpdateMediaDto } from './dto/update-media.dto';
import { DeleteMediaDto } from './dto/delete-media.dto';

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':id/upload-media')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload media files for a service' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', required: true, description: 'Service ID' })
  @ApiBody({
    description: 'Upload up to 10 media files',
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Media uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No files uploaded' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async uploadMedia(
    @Param('id') serviceId: ObjectId,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new Error('No files uploaded');

    const fileUrls = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadFile(file)),
    );

    return this.serviceService.addMediaToService(serviceId, fileUrls);
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a media file on a service' })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: 200, type: Service })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async updateMedia(
    @Param('id') serviceId: ObjectId,
    @Body() UpdateMediaDto: UpdateMediaDto,
  ) {
    return this.serviceService.updateMediaInService(
      serviceId,
      UpdateMediaDto.oldFileUrl,
      UpdateMediaDto.newFileUrl,
    );
  }

  @Delete(':id/delete-media')
  @ApiOperation({ summary: 'Delete a media file from a service' })
  @ApiResponse({ type: Service })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiBody({ type: DeleteMediaDto })
  async deleteMedia(
    @Param('id') serviceId: ObjectId,
    @Body() deleteMediaDto: DeleteMediaDto,
  ) {
    return this.serviceService.deleteMediaFromService(
      serviceId,
      deleteMediaDto.fileUrl,
    );
  }
}
