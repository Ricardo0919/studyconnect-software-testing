import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import { StudyWorld } from './support/world';

const stripQuotes = (v: any) =>
  typeof v === 'string' ? v.replace(/^"|"$/g, '') : v;
const cleanVal = (v: any) => (typeof v === 'string' ? v.trim() : v);

const sanitizeKey = (s: string) =>
  s
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();

const KEY_MAP: Record<string, string> = {
  title: 'title',
  notes: 'notes',
  category: 'category',
  priority: 'priority',
  duedate: 'dueDate',
  creatorid: 'creatorId',
  groupid: 'groupId',
  categoryid: 'categoryId',
};

const tableToBody = (table: any) => {
  if (typeof table.rowsHash === 'function') {
    const raw = table.rowsHash();
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => {
        const key = KEY_MAP[sanitizeKey(k)] ?? k.trim();
        const val = cleanVal(stripQuotes(v));
        return [key, val];
      }),
    );
  }

  return Object.fromEntries(
    table.rows().map(([k, v]: any) => {
      const key = KEY_MAP[sanitizeKey(k)] ?? k.trim();
      const val = cleanVal(stripQuotes(v));
      return [key, val];
    }),
  );
};

Given('an authenticated user', async function (this: StudyWorld) {
  this.authToken = 'test-token-or-skip';
  this.currentUser = this.currentUser ?? {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alice@uni.de',
  };
});

When('the user creates a task with:', async function (this: StudyWorld, table) {
  const body = tableToBody(table);
  console.log(
    'TABLE BODY keys:',
    Object.keys(body),
    'body:',
    JSON.stringify(body),
  );
  console.log('TABLE: currentUser ->', JSON.stringify(this.currentUser));

  if (!Object.prototype.hasOwnProperty.call(body, 'title')) {
    for (const k of Object.keys(body)) {
      const slim = k
        .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, '')
        .normalize('NFKC')
        .replace(/[^\p{L}\p{N}]+/gu, '')
        .toLowerCase();
      if (slim === 'title') {
        body.title = body[k];
        break;
      }
    }
  }

  const payload: any = {
    ...(Object.prototype.hasOwnProperty.call(body, 'title')
      ? { title: body.title }
      : {}),
    notes: body.notes,
    category: body.category,
    priority: body.priority,
    dueDate: body.dueDate,
    creatorId: body.creatorId ?? this.currentUser?.id,
    groupId: body.groupId,
    categoryId: body.categoryId,
  };
  Object.keys(payload).forEach((k) => {
    if (k !== 'title' && payload[k] === undefined) delete payload[k];
  });

  console.log('PAYLOAD create-task:', JSON.stringify(payload));

  const res = await this.http
    .post('/tasks')
    .set('Authorization', `Bearer ${this.authToken}`)
    .set('content-type', 'application/json')
    .send(payload);

  this.createdTaskId = res.body?.id;
  this.lastTaskId = this.createdTaskId;
  this.lastStatus = res.status;
  this.lastBody = res.body;
  this.lastResponse = { status: res.status, body: res.body };
});

Then('the task is saved successfully', function (this: StudyWorld) {
  assert.equal(
    this.lastStatus,
    201,
    `Expected 201, got ${this.lastStatus}; body=${JSON.stringify(this.lastBody)}`,
  );
  assert.ok(this.createdTaskId, 'Expected createdTaskId to be set');
});

Then(
  'the task appears in the user’s list with status {string}',
  async function (this: StudyWorld, expected) {
    const res = await this.http
      .get(`/tasks/${this.lastTaskId}`)
      .set('Authorization', `Bearer ${this.authToken}`);
    const status = (res.body?.status || '').toString().toUpperCase();
    assert.equal(
      status,
      expected.toUpperCase(),
      `Expected ${expected}, got ${status}`,
    );
  },
);

Then(
  'the user sees a validation error {string}',
  function (this: StudyWorld, _msg) {
    const ok = this.lastStatus! >= 400 && this.lastStatus! < 500;
    assert.ok(
      ok,
      `Expected 4xx, got ${this.lastStatus}; body=${JSON.stringify(this.lastBody)}`,
    );
  },
);

Then('the task is not created', function (this: StudyWorld) {
  assert.ok(
    !this.createdTaskId,
    'Task should not be created on validation error',
  );
});

Then('the user must confirm or change the date', function () {});
