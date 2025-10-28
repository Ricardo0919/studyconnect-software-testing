/// <reference types="jest" />
import { Category } from './category.entity';

describe('Category entity (domain)', () => {
  it('creates with name/description', () => {
    const c = new Category();
    c.name = 'Algebra';
    c.description = 'Linear Algebra';
    expect(c.name).toBe('Algebra');
    expect(c.description).toBe('Linear Algebra');
  });
});
