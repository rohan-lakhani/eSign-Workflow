import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { SignDocumentDto } from './dto/sign-document.dto';
import { DocumentsService } from '../documents/documents.service';
import { ESignService } from '../services/esign.service';
import { EmailService } from '../services/email.service';
import { ConfigService } from '@nestjs/config';
import { generateRoleAccessToken } from '../utils/jwt.utils';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
    private documentsService: DocumentsService,
    private eSignService: ESignService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async create(createWorkflowDto: CreateWorkflowDto, userEmail?: string): Promise<any> {
    const { documentId, name, description, roles } = createWorkflowDto;

    // Validate document
    const document = await this.documentsService.findOne(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Validate roles
    if (!roles || !Array.isArray(roles) || roles.length !== 3) {
      throw new BadRequestException('Exactly 3 roles are required');
    }

    // Role 1 and Role 2 must have email
    if (!roles[0].email) {
      throw new BadRequestException('Role 1 email is required');
    }

    if (!roles[1].email) {
      throw new BadRequestException('Role 2 email is required');
    }

    const jwtSecret = this.configService.get<string>('jwt.secret', 'default-secret');

    // Create workflow
    const workflow = new this.workflowModel({
      documentId,
      name: name || `Workflow for ${document.originalName}`,
      description,
      createdBy: userEmail || roles[0].email,
      roles: roles.map((role, index) => ({
        roleNumber: index + 1,
        email: role.email || null,
        name: role.name || `Role ${index + 1}`,
        accessToken: generateRoleAccessToken(documentId, index + 1, jwtSecret),
      })),
      metadata: {
        totalSignatures: 3,
        completedSignatures: 0,
      },
    });

    await workflow.save();

    return {
      id: workflow._id,
      name: workflow.name,
      status: workflow.status,
      currentRole: workflow.currentRole,
      roles: workflow.roles.map(r => ({
        roleNumber: r.roleNumber,
        email: r.email,
        name: r.name,
        status: r.status,
      })),
      createdAt: (workflow as any).createdAt,
    };
  }

  async submitForSigning(id: string): Promise<any> {
    const workflow = await this.workflowModel.findById(id).populate('documentId');
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflow.status !== 'draft') {
      throw new BadRequestException('Workflow already submitted');
    }

    const document: any = workflow.documentId;
    const pdfBuffer = await this.documentsService.getFileBuffer(document._id);

    // Upload document to eSign service
    const uploadResult = await this.eSignService.uploadDocument(
      pdfBuffer,
      document.originalName,
    );

    // Create signature request
    const signers = workflow.roles.map(role => ({
      email: role.email,
      name: role.name,
      role: `role${role.roleNumber}`,
      order: role.roleNumber,
    }));

    const requestResult = await this.eSignService.createSignatureRequest(
      uploadResult.documentId,
      signers,
    );

    // Update workflow
    workflow.status = 'active';
    workflow.metadata.externalDocumentId = uploadResult.documentId;
    workflow.metadata.requestId = requestResult.requestId;
    await workflow.save();

    // Send email to Role 1
    const role1 = (workflow as any).getRoleByNumber(1);
    const frontendUrl = this.configService.get<string>('frontendUrl');
    const signingUrl = `${frontendUrl}/sign/${workflow._id}?token=${role1.accessToken}`;

    try {
      await this.emailService.sendSignatureRequest(
        role1.email,
        role1.name,
        document.originalName,
        signingUrl,
        1,
      );
      role1.status = 'notified';
      await workflow.save();
    } catch (emailError) {
      console.error('Failed to send email to Role 1:', emailError);
    }

    return {
      id: workflow._id,
      status: workflow.status,
      currentRole: workflow.currentRole,
    };
  }

  async signDocument(
    id: string,
    roleNumber: number,
    signDto: SignDocumentDto,
  ): Promise<any> {
    const { signature, role3Email } = signDto;

    const workflow = await this.workflowModel.findById(id).populate('documentId');
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    // Verify current role
    if (workflow.currentRole !== roleNumber) {
      throw new BadRequestException('Not your turn to sign');
    }

    const currentRole = (workflow as any).getCurrentRole();
    if (currentRole.status === 'signed') {
      throw new BadRequestException('Already signed');
    }

    // For Role 2, require Role 3 email
    if (roleNumber === 2 && !role3Email) {
      throw new BadRequestException('Role 3 email is required');
    }

    // Update role 3 email if provided
    if (roleNumber === 2 && role3Email) {
      (workflow as any).updateRoleEmail(3, role3Email);
    }

    // Mark as signed
    (workflow as any).markRoleSigned(roleNumber);
    currentRole.signatureData = {
      signedAt: new Date(),
      signature: signature || 'mock-signature',
    };

    await workflow.save();

    const document: any = workflow.documentId;

    // Send notification to next role or completion
    if (workflow.status === 'completed') {
      // Send completion notifications to all signers
      for (const role of workflow.roles) {
        if (role.email) {
          try {
            const downloadUrl = `${this.configService.get<string>('backendUrl')}/api/documents/${document._id}/download`;
            await this.emailService.sendCompletionNotification(
              role.email,
              document.originalName,
              downloadUrl,
            );
          } catch (emailError) {
            console.error(`Failed to send completion email to ${role.email}:`, emailError);
          }
        }
      }
    } else {
      // Send to next role
      const nextRole = (workflow as any).getCurrentRole();
      if (nextRole && nextRole.email) {
        const frontendUrl = this.configService.get<string>('frontendUrl');
        const signingUrl = `${frontendUrl}/sign/${workflow._id}?token=${nextRole.accessToken}`;
        try {
          await this.emailService.sendSignatureRequest(
            nextRole.email,
            nextRole.name,
            document.originalName,
            signingUrl,
            nextRole.roleNumber,
          );
          nextRole.status = 'notified';
          await workflow.save();
        } catch (emailError) {
          console.error(`Failed to send email to Role ${nextRole.roleNumber}:`, emailError);
        }
      }
    }

    return {
      id: workflow._id,
      status: workflow.status,
      currentRole: workflow.currentRole,
      completedAt: workflow.completedAt,
    };
  }

  async findOne(id: string): Promise<any> {
    const workflow = await this.workflowModel.findById(id).populate('documentId');
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const document: any = workflow.documentId;

    return {
      id: workflow._id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      currentRole: workflow.currentRole,
      document: {
        id: document._id,
        name: document.originalName,
      },
      roles: workflow.roles.map(r => ({
        roleNumber: r.roleNumber,
        email: r.email,
        name: r.name,
        status: r.status,
        signedAt: r.signedAt,
      })),
      metadata: workflow.metadata,
      createdAt: (workflow as any).createdAt,
      completedAt: workflow.completedAt,
    };
  }
} 