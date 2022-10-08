// import { Module } from '@nestjs/common';
// import { AppController } from './app/app.controller';
// import { AppService } from './app/app.service';
// import { AuthModule } from './auth/auth.module';
// import { AccountsModule } from './accounts/accounts.module';
// import { TasksModule } from './tasks/tasks.module';

// @Module({
//   imports: [AuthModule, AccountsModule, TasksModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

/* eslint-disable hexagonal-architecture/enforce */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AccountsModule } from './accounts/accounts.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { configValidationSchema } from './config.schema';

import { AppController } from './app/infrastructure/app.controller';
import { AppService } from './app/application/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('STAGE') === 'prod';

        return {
          ssl: isProduction,
          extra: {
            ssl: isProduction ? { rejectUnauthorized: false } : null,
          },
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
        };
      },
    }),
    AccountsModule,
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
