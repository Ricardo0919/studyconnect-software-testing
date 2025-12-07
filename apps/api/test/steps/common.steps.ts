import assert from 'assert';
import { Then } from '@cucumber/cucumber';

Then('the user sees a warning {string}', function (msg: string) {
  const { lastStatus: status, lastBody: body } = this;
  assert(
    status >= 400 && status < 500,
    `Expected 4xx, got ${status}; body=${JSON.stringify(body)}`,
  );
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  assert(text.includes(msg), `Body does not include "${msg}" -> ${text}`);
});

Then('the user sees {string}', function (msg: string) {
  const { lastStatus: status, lastBody: body } = this;
  assert(
    status >= 400 && status < 600,
    `Expected error, got ${status}; body=${JSON.stringify(body)}`,
  );
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  assert(text.includes(msg), `Body does not include "${msg}" -> ${text}`);
});
