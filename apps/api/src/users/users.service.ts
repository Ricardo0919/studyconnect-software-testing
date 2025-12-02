import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async register(data: { email: string; displayName: string; password: string; role?: UserRole }) {
    const normalizedEmail = this.normalizeEmail(data.email);
    await this.ensureEmailIsUnique(normalizedEmail);

    const passwordResult = this.validatePasswordRules(data.password);
    if (!passwordResult.valid) {
      throw new BadRequestException(`Password requirements not met: ${passwordResult.errors.join(', ')}`);
    }

    const entity = this.repo.create({
      email: normalizedEmail,
      displayName: data.displayName.trim(),
      role: data.role ?? UserRole.STUDENT,
    });
    entity.setPassword(data.password);

    const saved = await this.repo.save(entity);
    return this.stripSensitive(saved);
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.repo.findOne({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user || !user.verifyPassword(password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.stripSensitive(user);
  }

  async assignRole(userId: string, role: UserRole) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    const saved = await this.repo.save(user);
    return this.stripSensitive(saved);
  }

  async updateProfile(userId: string, changes: { displayName?: string; password?: string }) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (typeof changes.displayName === 'string') {
      user.displayName = changes.displayName.trim();
    }

    if (changes.password) {
      const result = this.validatePasswordRules(changes.password);
      if (!result.valid) {
        throw new BadRequestException(`Password requirements not met: ${result.errors.join(', ')}`);
      }
      user.setPassword(changes.password);
    }

    const saved = await this.repo.save(user);
    return this.stripSensitive(saved);
  }

  validatePasswordRules(password: string) {
    const errors = [];
    const value = password ?? '';
    if (value.length < 8) errors.push('minLength');
    if (!/[A-Z]/.test(value)) errors.push('uppercase');
    if (!/[a-z]/.test(value)) errors.push('lowercase');
    if (!/[0-9]/.test(value)) errors.push('digit');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors.push('specialChar');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async create(data: { email: string; displayName: string; password: string; role?: UserRole }) {
    return this.register(data);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  private async ensureEmailIsUnique(email: string) {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');
  }

  private stripSensitive(user: User) {
    if (!user) return user;
    const plain = { ...user } as any;
    delete plain.passwordHash;
    return plain;
  }

  private normalizeEmail(email: string) {
    return String(email ?? '').trim().toLowerCase();
  }
}
