import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService implements OnModuleInit {
  getHello(): string {
    return 'Hello World!';
  }
  private client: MongoClient;

  constructor() {
    this.client = new MongoClient(process.env.DATABASE_URL);
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
    } finally {
      await this.client.close();
    }
  }
}
