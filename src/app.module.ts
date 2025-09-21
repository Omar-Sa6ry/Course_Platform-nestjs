import { Module, Scope } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database/database';
import { GraphqlModule } from './common/graphql/graphql.module';
import { ConfigModule } from './common/config/config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TranslationModule } from './common/translation/translation.module';
import { AppResolver } from './app.resolver';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { CategoryModule } from './modules/category/category.module';
import { CourseModule } from './modules/courses/course.module';
import { RequestModule } from './modules/request/request.module';

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    DatabaseModule,
    ThrottlerModule,
    TranslationModule,

    AuthModule,
    UserModule,
    CategoryModule,
    CourseModule,
    RequestModule,
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
