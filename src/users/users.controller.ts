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
  Request,
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
import { SignInDto } from './dto/signin-request.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly vendorService: ServiceService,
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
    const vendor = await this.vendorService.createService(
      user.email,
      serviceDto,
    );
    return { message: 'Vendor application submitted', vendor };
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
