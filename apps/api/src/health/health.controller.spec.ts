/// <reference types="jest" />
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm'; // <-- importa la clase

describe('HealthController', () => {
  it('ping returns ok', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DataSource, useValue: { query: jest.fn() } }, // <-- usa la clase como token
      ],
    }).compile();

    const ctrl = module.get<HealthController>(HealthController);
    expect(ctrl.ping()).toEqual({ ok: true, service: 'studyconnect-api' });
  });

  it('ready returns ok when DB up', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: { query: jest.fn().mockResolvedValueOnce({}) },
        },
      ],
    }).compile();

    const ctrl = module.get<HealthController>(HealthController);
    await expect(ctrl.ready()).resolves.toEqual({
      ok: true,
      deps: { db: 'up' },
    });
  });

  it('ready throws 503 when DB down', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: {
            query: jest.fn().mockRejectedValueOnce(new Error('down')),
          },
        },
      ],
    }).compile();

    const ctrl = module.get<HealthController>(HealthController);
    await expect(ctrl.ready()).rejects.toMatchObject({ status: 503 });
  });
});
