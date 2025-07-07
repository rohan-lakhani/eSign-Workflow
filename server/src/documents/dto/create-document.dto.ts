import { IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  uploadedBy?: string;
} 