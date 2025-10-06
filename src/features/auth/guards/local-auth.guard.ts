import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';

@Injectable()
export class LocalAuthGuard extends AuthGuard(PASSPORT_STRATEGY_NAME.LOCAL) {}
