import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ServiceService } from './service.service';
import { ServiceGuard } from './guards/service.guard';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('service')
@UseGuards(ServiceGuard)
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post(':id/upload-media')
  @UseInterceptors(FilesInterceptor('files', 10))
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
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateServiceDto) {
    return this.serviceService.update(+id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(+id);
  }
}
