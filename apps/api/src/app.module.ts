import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { GroupsModule } from './groups/groups.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { GamificationModule } from './gamification/gamification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService): TypeOrmModuleOptions => {
        const nodeEnv = cs.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
        const isTest = nodeEnv === 'test';

        const host = cs.get<string>('DATABASE_HOST') ?? 'localhost';
        const port = parseInt(cs.get<string>('DATABASE_PORT') ?? '5432', 10);
        const username = cs.get<string>('DATABASE_USER') ?? 'studyconnect_app_db';
        const password =
          cs.get<string>('DATABASE_PASSWORD') ?? 'super_secure_password_123';

        const dbName = isTest
          ? cs.get<string>('DATABASE_NAME_TEST') ?? 'studyconnect_testing'
          : cs.get<string>('DATABASE_NAME') ?? 'studyconnect';

        const sync = (cs.get<string>('DB_SYNC') ?? 'true') === 'true';
        const loggingEnv = (cs.get<string>('DB_LOGGING') ?? 'true') === 'true';

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database: dbName,
          autoLoadEntities: true,
          synchronize: sync,
          dropSchema: isTest,
          logging: isTest ? false : loggingEnv,
        };
      },
    }),

    UsersModule,
    HealthModule,
    CommonModule,
    GroupsModule,
    TasksModule,
    CategoriesModule,
    CommentsModule,
    GamificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
