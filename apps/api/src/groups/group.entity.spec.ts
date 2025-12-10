/// <reference types="jest" />
import { Group } from './group.entity';
import { User } from '../users/user.entity';

describe('Group entity (domain)', () => {
  it('creates with name and owner', () => {
    const owner = new User();
    owner.id = 'u1';
    owner.email = 'owner@example.com';
    owner.displayName = 'Owner';

    const g = new Group();
    g.name = 'Math Squad';
    g.owner = owner;

    expect(g.name).toBe('Math Squad');
    expect(g.owner).toBe(owner);
  });

  it('manages members collection', () => {
    const u1 = Object.assign(new User(), { id: 'u1' });
    const u2 = Object.assign(new User(), { id: 'u2' });

    const g = new Group();
    g.members = [];
    g.members.push(u1);
    g.members.push(u2);

    expect(g.members.map((m) => m.id)).toEqual(['u1', 'u2']);

    // remove u1
    g.members = g.members.filter((m) => m.id !== 'u1');
    expect(g.members.map((m) => m.id)).toEqual(['u2']);
  });

  it('addMember avoids duplicate members and removeMember is idempotent', () => {
    const u1 = Object.assign(new User(), { id: 'u1' });

    const g = new Group();
    g.members = [];

    g.addMember(u1);
    g.addMember(u1);
    expect(g.members.map((m) => m.id)).toEqual(['u1']);

    g.removeMember('u1');
    expect(g.members).toEqual([]);

    g.removeMember('u1');
    expect(g.members).toEqual([]);
  });
});
