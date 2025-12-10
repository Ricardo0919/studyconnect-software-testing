/// <reference types="jest" />
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Core flow (e2e) — Test API', () => {
  let app: INestApplication;
  let ds: DataSource;

  const http = () => request(app.getHttpServer());
  const ts = Date.now();

  let userA: string;
  let userB: string;
  let groupId: string;
  let categoryId: string;
  let taskId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
    ds = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
    if (ds && ds.isInitialized) await ds.destroy();
  });

  it('health up', async () => {
    await http()
      .get('/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
      });
  });

  it('create user A', async () => {
    const res = await http()
      .post('/users')
      .send({
        email: `charlie+${ts}@example.com`,
        displayName: `Charlie ${ts}`,
      })
      .expect(201);
    userA = res.body.id;
    expect(userA).toBeDefined();
  });

  it('create user B', async () => {
    const res = await http()
      .post('/users')
      .send({ email: `dana+${ts}@example.com`, displayName: `Dana ${ts}` })
      .expect(201);
    userB = res.body.id;
    expect(userB).toBeDefined();
  });

  it('create group', async () => {
    const res = await http()
      .post('/groups')
      .send({
        name: `Quantum Crew ${ts}`,
        description: 'Physics study squad',
        ownerId: userA,
      })
      .expect(201);
    groupId = res.body.id;
    expect(groupId).toBeDefined();
  });

  it('create category', async () => {
    const res = await http()
      .post('/categories')
      .send({ name: `Calculus ${ts}`, description: 'Derivatives & Integrals' })
      .expect(201);
    categoryId = res.body.id;
    expect(categoryId).toBeDefined();
  });

  it('create task', async () => {
    const res = await http()
      .post('/tasks')
      .send({
        title: `Problem Set #1 ${ts}`,
        notes: 'Prioritize chain rule examples',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        creatorId: userA,
        groupId,
        categoryId,
      })
      .expect(201);
    taskId = res.body.id;
    expect(taskId).toBeDefined();
    expect(res.body.status).toBe('OPEN');
  });

  it('assign task to user B (should be forbidden without proper auth/role)', async () => {
    const res = await http().post(`/tasks/${taskId}/assign/${userB}`);
    expect(res.status).toBe(403);
  });

  it('comment on task (by user A)', async () => {
    const res = await http()
      .post('/comments')
      .send({
        content: 'I’ll take Q1–Q3, can you handle Q4–Q6?',
        authorId: userA,
        taskId,
      })
      .expect(201);
    expect(res.body.id).toBeDefined();
  });

  it('list tasks (should include the created one)', async () => {
    const res = await http().get('/tasks').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((t: any) => t.id === taskId);
    expect(found).toBeTruthy();
    expect(found.assignees?.length ?? 0).toBe(0);

    expect(found.group?.id).toBe(groupId);
    expect(found.category?.id).toBe(categoryId);
  });
});
