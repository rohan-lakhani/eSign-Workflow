import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Document } from '../../documents/schemas/document.schema';

export type WorkflowDocument = HydratedDocument<Workflow>;

@Schema({ _id: false })
export class Role {
  @Prop({ required: true, min: 1, max: 3 })
  roleNumber: number;

  @Prop({ sparse: true })
  email?: string;

  @Prop()
  name: string;

  @Prop({
    type: String,
    enum: ['pending', 'notified', 'viewed', 'signed', 'completed'],
    default: 'pending',
  })
  status: string;

  @Prop()
  signedAt?: Date;

  @Prop()
  accessToken: string;

  @Prop({ type: Object })
  signatureData?: {
    documentId?: string;
    signatureId?: string;
    signedFields?: Array<{
      fieldId: string;
      value: string;
      signedAt: Date;
    }>;
  };
}

const RoleSchema = SchemaFactory.createForClass(Role);

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ type: Types.ObjectId, ref: 'Document', required: true })
  documentId: Types.ObjectId | Document;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Prop({ default: 1, min: 1, max: 3 })
  currentRole: number;

  @Prop({ type: [RoleSchema] })
  roles: Role[];

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  completedAt?: Date;

  @Prop({ type: Object })
  metadata: {
    totalSignatures?: number;
    completedSignatures?: number;
    externalDocumentId?: string;
    requestId?: string;
    webhookUrl?: string;
  };
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);

// Indexes
WorkflowSchema.index({ status: 1, createdAt: -1 });
WorkflowSchema.index({ 'roles.email': 1 });
WorkflowSchema.index({ 'roles.accessToken': 1 });

// Methods
WorkflowSchema.methods.getCurrentRole = function() {
  return this.roles.find((role: Role) => role.roleNumber === this.currentRole);
};

WorkflowSchema.methods.getRoleByNumber = function(roleNumber: number) {
  return this.roles.find((role: Role) => role.roleNumber === roleNumber);
};

WorkflowSchema.methods.updateRoleEmail = function(roleNumber: number, email: string) {
  const role = this.getRoleByNumber(roleNumber);
  if (role) {
    role.email = email;
    return true;
  }
  return false;
};

WorkflowSchema.methods.markRoleSigned = function(roleNumber: number) {
  const role = this.getRoleByNumber(roleNumber);
  if (role) {
    role.status = 'signed';
    role.signedAt = new Date();
    this.metadata.completedSignatures = (this.metadata.completedSignatures || 0) + 1;
    
    // Move to next role or complete workflow
    if (roleNumber < 3) {
      this.currentRole = roleNumber + 1;
    } else {
      this.status = 'completed';
      this.completedAt = new Date();
    }
    return true;
  }
  return false;
}; 