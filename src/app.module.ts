import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database';
import { GraphqlModule } from './common/graphql/graphql.module';
import { ConfigModule } from './common/config/config.module';

@Module({
  imports: [DatabaseModule, GraphqlModule, ConfigModule],
  providers: [AppService],
})
export class AppModule {}
