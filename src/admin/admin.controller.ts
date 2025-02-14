import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Service } from '../service/entities/service.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('approve-vendor')
  @ApiOperation({ summary: 'Approve a service provider' })
  @ApiResponse({
    status: 200,
    description: 'Service provider  approved successfully',
    type: Service,
  })
  @ApiQuery({ name: 'id', type: ObjectId, description: 'service ID' })
  async approveService(@Query('id') id: ObjectId) {
    const service = await this.adminService.approveService(id);
    return { message: 'Service provider approved successfully', service };
  }

  @Get('reject-vendor')
  @ApiOperation({ summary: 'Reject a vendor' })
  @ApiResponse({
    status: 200,
    description: 'Service rejected',
    type: Service,
  })
  @ApiQuery({ name: 'id', type: ObjectId, description: 'service ID' })
  async rejectVendor(@Query('id') id: ObjectId) {
    const service = await this.adminService.rejectVendor(id);
    return { message: 'Vendor rejected', service };
  }
}
