import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorGuard } from './guards/vendor.guard';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @UseGuards(VendorGuard)
  @Post('create-service')
  createService() {
    return 'Service created by a vendor!';
  }

  @Get()
  findAll() {
    return this.vendorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorService.update(+id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorService.remove(+id);
  }
}
