import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';

const toEnum = (s: string) =>
  s.replace(/^"|"$/g, '').toUpperCase().replace(/\s+/g, '_');

Given(
  'an existing task {string} with status {string}',
  async function (title: string, status: string) {
    const res = await this.http
      .post('/tasks')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        title: title.replace(/^"|"$/g, ''),
        creatorId: this.currentUser?.id,
      });
    this.lastTaskId = res.body?.id;

    const desired = toEnum(status);
    if (desired !== 'OPEN') {
      await this.http
        .patch(`/tasks/${this.lastTaskId}/status`)
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({ status: desired });
    }
  },
);

Given(
  'the task {string} has status {string}',
  async function (_title: string, status: string) {
    const target = toEnum(status);

    const pathByTarget: Record<string, string[]> = {
      OPEN: [],
      IN_PROGRESS: ['IN_PROGRESS'],
      BLOCKED: ['BLOCKED'],
      COMPLETED: ['IN_PROGRESS', 'COMPLETED'],
      OVERDUE: [],
    };

    const path = pathByTarget[target] ?? [];
    for (const step of path) {
      const res = await this.http
        .patch(`/tasks/${this.lastTaskId}/status`)
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({ status: step });
      assert.ok(
        res.status >= 200 && res.status < 300,
        `Failed to set status ${step}; got ${res.status}`,
      );
    }

    const check = await this.http
      .get(`/tasks/${this.lastTaskId}`)
      .set('Authorization', `Bearer ${this.authToken}`);
    const current = (check.body?.status || '').toString().toUpperCase();
    assert.equal(
      current,
      target,
      `Precondition failed: expected ${target}, got ${current}`,
    );
  },
);

When(
  'the user changes status of {string} to {string}',
  async function (_title: string, next: string) {
    const res = await this.http
      .patch(`/tasks/${this.lastTaskId}/status`)
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({ status: toEnum(next) });
    this.lastStatus = res.status;
    this.lastBody = res.body;
    this.lastResponse = { status: res.status, body: res.body };
  },
);

Then(
  'the task {string} shows status {string}',
  async function (_title: string, expected: string) {
    const res = await this.http
      .get(`/tasks/${this.lastTaskId}`)
      .set('Authorization', `Bearer ${this.authToken}`);
    const status = (res.body?.status ?? '').toString().toUpperCase();
    assert.equal(
      status,
      expected.toUpperCase(),
      `Expected ${expected}, got ${status}`,
    );
  },
);

Then('the status remains {string}', async function (expected: string) {
  const res = await this.http
    .get(`/tasks/${this.lastTaskId}`)
    .set('Authorization', `Bearer ${this.authToken}`);
  const status = (res.body?.status ?? '').toString().toUpperCase();
  assert.equal(
    status,
    expected.toUpperCase(),
    `Expected ${expected}, got ${status}`,
  );
});

Given(
  'the task {string} with status {string} and dueDate {string}',
  async function (title: string, status: string, dueDate: string) {
    const res = await this.http
      .post('/tasks')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        title: title.replace(/^"|"$/g, ''),
        creatorId: this.currentUser?.id,
        dueDate: dueDate.replace(/^"|"$/g, ''),
      });
    this.lastTaskId = res.body?.id;

    const desired = toEnum(status);
    if (desired !== 'OPEN') {
      await this.http
        .patch(`/tasks/${this.lastTaskId}/status`)
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({ status: desired });
    }
  },
);

Given('the test clock is set to {string}', function (iso: string) {
  this.testClock = iso.replace(/^"|"$/g, '');
});

When('the system evaluates overdue tasks', async function () {
  const res = await this.http
    .post('/tasks/evaluate-overdue')
    .set('Authorization', `Bearer ${this.authToken}`)
    .send({ now: this.testClock ?? new Date().toISOString() });
  this.lastStatus = res.status;
  this.lastBody = res.body;
});

Then(
  'the task {string} is marked as {string}',
  async function (_title: string, expected: string) {
    const res = await this.http
      .get(`/tasks/${this.lastTaskId}`)
      .set('Authorization', `Bearer ${this.authToken}`);
    const status = (res.body?.status ?? res.body?.state ?? '')
      .toString()
      .toUpperCase();
    assert.equal(
      status,
      expected.toUpperCase(),
      `Expected ${expected}, got ${status}; body=${JSON.stringify(res.body)}`,
    );
  },
);
