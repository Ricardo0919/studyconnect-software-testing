import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { StudyWorld } from './world';

setDefaultTimeout(30_000);

Before<StudyWorld>(async function () {
  this.currentUser = this.currentUser ?? {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alice@uni.de',
  };

  if (!this.app) {
    await this.initApp();
  }

  if (this.authToken) {
    this.authHeaders = { Authorization: `Bearer ${this.authToken}` };
  }

  try {
    const email = this.currentUser?.email ?? 'alice@uni.de';
    const displayName = (email.split && email.split('@')[0]) || 'alice';
    try {
      const res = await this.http.post('/users').send({ email, displayName });
      console.log('Hooks: POST /users ->', res.status, res.body);
      if (res && res.body && res.body.id) {
        this.currentUser = { id: res.body.id, email };
        console.log('Hooks: created user id', this.currentUser.id);
      } else if (res && res.status >= 400) {
        console.log(
          'Hooks: POST /users returned status >=400, will attempt GET /users fallback',
        );
        throw new Error('create-failed');
      }
    } catch (createErr) {
      console.log(
        'Hooks: create user failed, attempting to find by email',
        createErr &&
          (createErr.message || JSON.stringify(createErr.body || createErr)),
      );
      try {
        const all = await this.http.get('/users');
        console.log('Hooks: GET /users ->', all.status);
        console.log(
          'Hooks: GET /users body ->',
          JSON.stringify(all.body, null, 2),
        );
        if (all && Array.isArray(all.body)) {
          const found = all.body.find((u: any) => u.email === email);
          console.log('Hooks: found by email ->', found);
          if (found && found.id) {
            this.currentUser = { id: found.id, email };
            console.log('Hooks: set currentUser.id to', this.currentUser.id);
          } else if (all.body.length > 0) {
            const fallback = all.body[0];
            console.log(
              'Hooks: no user with email found, falling back to first user ->',
              fallback,
            );
            this.currentUser = { id: fallback.id, email: fallback.email };
          }
        }
      } catch (e2) {
        console.log('Hooks: fallback GET /users failed', e2 && e2.message);
      }
    }
  } catch (e) {}

  this.createdTaskId = undefined;
  this.lastTaskId = undefined;
  this.groupId = undefined;

  this.lastStatus = undefined;
  this.lastBody = undefined;
  this.lastResponse = undefined;

  this.testClock = undefined;
});

After<StudyWorld>(async function () {
  await this.closeApp();
});
