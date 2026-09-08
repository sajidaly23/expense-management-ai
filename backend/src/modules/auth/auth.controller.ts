import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getCurrentUser, loginUser, registerUser } from './auth.service.js';
import { LoginInput, RegisterInput } from './auth.validation.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body as RegisterInput);
  res.status(201).json({
    status: 'success',
    message: 'Account created.',
    ...result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body as LoginInput);
  res.status(200).json({
    status: 'success',
    message: 'Signed in.',
    ...result,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.user!.id);
  res.status(200).json({
    status: 'success',
    user,
  });
});
