import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { SignDocumentDto } from './dto/sign-document.dto';
import { RoleAuthGuard } from '../auth/guards/role-auth.guard';

@Controller('api/workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  async createWorkflow(
    @Body(ValidationPipe) createWorkflowDto: CreateWorkflowDto,
    @Req() req: Request,
  ) {
    const userEmail = (req as any).user?.email;
    const workflow = await this.workflowsService.create(createWorkflowDto, userEmail);
    return { success: true, workflow };
  }

  @Post(':workflowId/submit')
  async submitWorkflow(
    @Param('workflowId') workflowId: string,
  ) {
    const workflow = await this.workflowsService.submitForSigning(workflowId);
    return { success: true, workflow };
  }

  @Post(':workflowId/sign')
  @UseGuards(RoleAuthGuard)
  async signDocument(
    @Param('workflowId') workflowId: string,
    @Body(ValidationPipe) signDto: SignDocumentDto,
    @Req() req: Request,
  ) {
    const roleNumber = (req as any).roleAccess.roleNumber;
    const result = await this.workflowsService.signDocument(
      workflowId,
      roleNumber,
      signDto,
    );
    return { success: true, ...result };
  }

  @Get(':workflowId')
  @UseGuards(RoleAuthGuard)
  async getWorkflow(
    @Param('workflowId') workflowId: string,
    @Req() req: Request,
  ) {
    const roleNumber = (req as any).roleAccess.roleNumber;
    const workflow = await this.workflowsService.findOne(workflowId);
    
    // Only return role-specific information
    const currentRole = workflow.roles.find(r => r.roleNumber === roleNumber);
    
    return {
      success: true,
      workflow: {
        ...workflow,
        currentUserRole: currentRole,
      },
    };
  }
} 