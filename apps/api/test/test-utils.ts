/// <reference types="jest" />
export const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn((x) => x),
  remove: jest.fn(),
  delete: jest.fn(),
});

export const createMock = <T extends object>(
  impl?: Partial<Record<keyof T, any>>,
): T =>
  ({
    ...(impl ?? {}),
  }) as T;
