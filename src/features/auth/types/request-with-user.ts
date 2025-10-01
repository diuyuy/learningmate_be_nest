import { Request } from 'express';
import { MemberInfo } from './member-info';

export type RequestWithUser = Omit<Request, 'user'> & { user: MemberInfo };
