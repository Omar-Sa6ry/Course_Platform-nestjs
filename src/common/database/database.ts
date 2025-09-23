import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/modules/category/entity/category.entity';
import { Course } from 'src/modules/courses/entity/course.entity';
import { Request } from 'src/modules/request/entity/request.entity';
import { User } from 'src/modules/users/entity/user.entity';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { Certificate } from 'src/modules/certificate/entity/certificate.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';
import { Review } from 'src/modules/review/entity/review.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Category,
          Course,
          Request,
          Certificate,
          Cart,
          CartItem,
          Review,
        ],
        logging: ['error', 'warn', 'query'], // Logs queries in development
        synchronize: true,
      }),

      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        return addTransactionalDataSource(dataSource);
      },
    }),
  ],
})
export class DatabaseModule {}
