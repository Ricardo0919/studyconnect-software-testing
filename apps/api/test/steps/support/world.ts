import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test as NestTest } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

@Injectable()
class NoopGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

export type ApiResponse = { status: number; body: any };

export class StudyWorld extends World {
  app!: INestApplication;
  http!: ReturnType<typeof request>;

  // Auth / context
  authToken?: string;
  authHeaders?: Record<string, string>;
  currentUser?: { id: string; email: string };

  // For steps
  createdTaskId?: string;
  lastTaskId?: string;
  groupId?: string;

  lastStatus?: number;
  lastBody?: any;
  lastResponse?: ApiResponse;

  // Overdue Clock
  testClock?: string;

  constructor(opts: IWorldOptions) {
    super(opts);
  }

  async initApp() {
    const builder = NestTest.createTestingModule({ imports: [AppModule] })
      .overrideProvider(APP_GUARD)
      .useValue(new NoopGuard());

    const moduleRef = await builder.compile();

    this.app = moduleRef.createNestApplication();

    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    this.app.use((req, _res, next) => {
      req.user = this.currentUser ?? {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'alice@uni.de',
      };
      next();
    });

    await this.app.init();
    this.http = request(this.app.getHttpServer());
  }

  async closeApp() {
    if (this.app) await this.app.close();
  }
}

setWorldConstructor(StudyWorld);
