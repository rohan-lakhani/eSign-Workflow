import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { Workflow, WorkflowSchema } from './schemas/workflow.schema';
import { DocumentsModule } from '../documents/documents.module';
import { ESignService } from '../services/esign.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }]),
    DocumentsModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, ESignService, EmailService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {} 