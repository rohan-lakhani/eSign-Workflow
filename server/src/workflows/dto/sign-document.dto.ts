import { IsString, IsOptional, IsEmail } from 'class-validator';

export class SignDocumentDto {
  @IsString()
  @IsOptional()
  signature?: string;

  @IsEmail()
  @IsOptional()
  role3Email?: string;
} 