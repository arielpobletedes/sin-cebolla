import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as bcrypt from 'bcrypt';
import * as schema from '../db/schema/index.js';
import { JwtPayload } from '@sin-cebolla/types';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { privateDecrypt } from 'crypto';
import { ConfigModule } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DB') private db: NeonHttpDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const [existing] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email));

    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const [user] = await this.db
      .insert(schema.users)
      .values({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        role: dto.role,
        password: hashedPassword,
      })
      .returning();

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user),
    };
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email));
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    return {
      user: this.sanitizeUser(user),
      token: this.generateToken(user),
    };
  }

  private generateToken(user: schema.NewUser) {
    const payload: JwtPayload = {
      sub: user.id!,
      email: user.email,
      role: user.role!,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: schema.User) {
    const { password, ...safeUser } = user;
    void password;
    return safeUser;
  }
}
