import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { isDatabaseConnected } from '../../config/db.js';
import { User, IUser } from './user.model.js';
import { LoginInput, RegisterInput } from './auth.validation.js';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: IUser['role'];
};

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw new AppError('Database is not connected. Try again in a moment.', 503);
  }
}

function toPublicUser(user: IUser): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function signToken(user: PublicUser) {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    options
  );
}

export async function registerUser(input: RegisterInput) {
  assertDatabase();

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
  });

  const publicUser = toPublicUser(user);
  return { token: signToken(publicUser), user: publicUser };
}

export async function loginUser(input: LoginInput) {
  assertDatabase();

  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const matches = await user.comparePassword(input.password);
  if (!matches) {
    throw new AppError('Invalid email or password.', 401);
  }

  const publicUser = toPublicUser(user);
  return { token: signToken(publicUser), user: publicUser };
}

export async function getCurrentUser(userId: string) {
  assertDatabase();

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return toPublicUser(user);
}
