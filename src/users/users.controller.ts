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
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ServiceService } from 'src/service/service.service';
import { CreateServiceDto } from 'src/service/dto/create-service.dto';
import { Service } from 'src/service/entities/service.entity';
import { ObjectId } from 'typeorm';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly serviceService: ServiceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'All users fetched successfully',
    type: [User],
  })
  async getUsers(@CurrentUser() user: User) {
    return this.usersService.findAll();
  }

  @Post('apply-for-vendor')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('idImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async applyForVendor(
    @CurrentUser() user: User,
    @Body() serviceDto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      serviceDto.idImage = file.filename;
    }
    const service = await this.serviceService.createService(
      user.email,
      serviceDto,
    );
    return { message: 'Service provider application submitted', service };
  }

  @Get('approve-vendor')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Approve a vendor' })
  @ApiResponse({
    status: 200,
    description: 'Vendor approved successfully',
    type: Service,
  })
  async approveVendor(@Query('id') id: string) {
    const service = await this.serviceService.approveVendor(id);
    return { message: 'Vendor approved successfully', service };
  }

  @Get('reject-vendor')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reject a vendor' })
  @ApiResponse({
    status: 200,
    description: 'Vendor rejected',
    type: Service,
  })
  async rejectVendor(@Query('id') id: ObjectId) {
    const service = await this.serviceService.rejectVendor(id);
    return { message: 'Vendor rejected', service };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
