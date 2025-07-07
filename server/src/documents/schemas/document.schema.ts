import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true, unique: true })
  filename: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop({
    type: String,
    enum: ['uploaded', 'processing', 'ready', 'signed', 'completed'],
    default: 'uploaded',
  })
  status: string;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);

// Create indexes
DocumentSchema.index({ uploadedBy: 1, createdAt: -1 }); 