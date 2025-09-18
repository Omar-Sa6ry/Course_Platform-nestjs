import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database';
import { GraphqlModule } from './common/graphql/graphql.module';

@Module({
  imports: [DatabaseModule, GraphqlModule],
  providers: [AppService],
})
export class AppModule {}
