import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
import type { World } from '@cucumber/cucumber';

function getHttpClient(world: any) {
  const http =
    world?.request ??
    world?.http ??
    world?.agent ??
    world?.api ??
    world?.supertest;

  return http;
}

Given(
  'a group {string} with members:',
  async function (groupName: string, table) {
    const rows = table.hashes();
    const byEmail = new Map<string, string>();
    let ownerEmail: string | null = null;

    for (const { role, user } of rows) {
      const email = user.trim();
      const displayName = email.split('@')[0];
      const roleUp = role.trim().toUpperCase();

      const uRes = await this.http
        .post('/users')
        .set('Authorization', `Bearer ${this.authToken}`)
        .send({ email, displayName, role: roleUp });

      let userId: string | undefined = uRes.body?.id;
      if (!userId) {
        const all = await this.http
          .get('/users')
          .set('Authorization', `Bearer ${this.authToken}`);
        const found = (Array.isArray(all.body) ? all.body : []).find(
          (x: any) => x.email === email,
        );
        if (found) userId = found.id;
      }
      if (!userId) {
        throw new Error(`Could not resolve userId for ${email}`);
      }
      byEmail.set(email, userId);

      if (roleUp === 'ADMIN') ownerEmail = email;
    }

    const ownerId = ownerEmail
      ? byEmail.get(ownerEmail)!
      : Array.from(byEmail.values())[0];
    const gRes = await this.http
      .post('/groups')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({ name: groupName, ownerId, description: null });

    this.groupId = gRes.body.id;

    for (const [email, userId] of byEmail.entries()) {
      if (userId === ownerId) continue;
      await this.http
        .post(`/groups/${this.groupId}/members/${userId}`)
        .set('Authorization', `Bearer ${this.authToken}`)
        .send();
    }
  },
);

Given(
  'a task {string} exists in group {string}',
  async function (title: string, _groupName: string) {
    const res = await this.http
      .post('/tasks')
      .set('Authorization', `Bearer ${this.authToken}`)
      .send({
        title: title.replace(/^"|"$/g, ''),
        creatorId: this.currentUser?.id,
        groupId: this.groupId,
      });
    this.lastTaskId = res.body?.id;
  },
);

Given('the current user is {string}', async function (email: string) {
  const clean = email.replace(/^"|"$/g, '');
  const res = await this.http.get('/users');
  const users = Array.isArray(res.body) ? res.body : [];
  const u = users.find((x: any) => x.email === clean);
  this.currentUser = {
    id: u?.id ?? '11111111-1111-1111-1111-111111111111',
    email: clean,
  };
});

When(
  'the user assigns {string} to {string}',
  async function (this: any, _title: string, rawEmail: string) {
    const http = this.http ?? this.request;
    if (!this.groupId || !this.lastTaskId)
      throw new Error('Missing groupId/lastTaskId');
    const assigneeEmail = rawEmail.replace(/^"|"$/g, '');

    let res = await http
      .patch(`/tasks/groups/${this.groupId}/tasks/${this.lastTaskId}/assignee`)
      .send({ assignee: assigneeEmail });

    this.lastStatus = res.status;
    this.lastBody = res.body;

    if (res.status >= 200 && res.status < 300) return;

    if (res.status === 403 || res.status === 400) return;

    if (res.status === 404 || res.status === 405) {
      const usersRes = await http.get('/users');
      const users = Array.isArray(usersRes.body) ? usersRes.body : [];
      const user = users.find((u: any) => u?.email === assigneeEmail);

      if (!user?.id) {
        this.lastStatus = 400;
        this.lastBody = { message: `User not found: ${assigneeEmail}` };
        return;
      }

      res = await http.post(`/tasks/${this.lastTaskId}/assign/${user.id}`);
      this.lastStatus = res.status;
      this.lastBody = res.body;
      return;
    }

    return;
  },
);

Then(
  'the task {string} shows assignee {string}',
  async function (this: any, title: string, expectedEmail: string) {
    const http = getHttpClient(this);
    assert(http, 'HTTP client not found on World');

    const listRes = await http
      .get(`/tasks?title=${encodeURIComponent(title)}`)
      .expect(200);
    const task = Array.isArray(listRes.body)
      ? listRes.body.find((t: any) => t?.title === title)
      : listRes.body?.title === title
        ? listRes.body
        : null;

    assert(
      task,
      `Task "${title}" not found. Body=${JSON.stringify(listRes.body)}`,
    );
    const taskId = task.id;

    const maxTries = 6;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let lastBody: any = null;

    for (let i = 0; i < maxTries; i++) {
      const getRes = await http.get(`/tasks/${taskId}`).expect(200);
      lastBody = getRes.body;

      const single =
        typeof lastBody?.assignee === 'string'
          ? lastBody.assignee
          : lastBody?.assignee?.email;

      const many = Array.isArray(lastBody?.assignees)
        ? lastBody.assignees
            .map((a: any) => (typeof a === 'string' ? a : a?.email))
            .filter(Boolean)
        : [];

      const emails = [single, ...many].filter(Boolean);

      if (emails.includes(expectedEmail)) return;

      await delay(120);
    }

    const single =
      typeof lastBody?.assignee === 'string'
        ? lastBody.assignee
        : lastBody?.assignee?.email;

    const many = Array.isArray(lastBody?.assignees)
      ? lastBody.assignees
          .map((a: any) => (typeof a === 'string' ? a : a?.email))
          .filter(Boolean)
      : [];

    const emails = [single, ...many].filter(Boolean);

    assert.fail(
      `Expected ${expectedEmail}, got ${emails.length ? emails.join(', ') : 'undefined'}. Body=${JSON.stringify(lastBody)}`,
    );
  },
);
