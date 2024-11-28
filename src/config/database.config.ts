import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  synchronize: true, // set to false in production
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
}));
