import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnModuleInit {
  getHello(): string {
    return 'Hello World!';
  }
  private client: MongoClient;

  constructor(private readonly configService: ConfigService) {
    const dbUrl = this.configService.get<string>('database.url');
    this.client = new MongoClient(dbUrl);
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('MongoDB connected successfully');
    } catch (error) {
      throw new InternalServerErrorException('Mongodb Error', error.message);
    } finally {
      await this.client.close();
    }
  }
}
