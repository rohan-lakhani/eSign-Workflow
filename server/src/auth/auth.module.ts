import { Module } from '@nestjs/common';
import { RoleAuthGuard } from './guards/role-auth.guard';

@Module({
  providers: [RoleAuthGuard],
  exports: [RoleAuthGuard],
})
export class AuthModule {} 