import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly ds: DataSource) {}

  // liveness
  @Get()
  ping() {
    return { ok: true, service: 'studyconnect-api' };
  }

  // Check DB
  @Get('ready')
  async ready() {
    try {
      await this.ds.query('SELECT 1');
      return { ok: true, deps: { db: 'up' } };
    } catch {
      throw new ServiceUnavailableException({
        ok: false,
        deps: { db: 'down' },
      });
    }
  }
}
