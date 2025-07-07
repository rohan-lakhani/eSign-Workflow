import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './schemas/document.schema';
import { CreateDocumentDto } from './dto/create-document.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    private configService: ConfigService,
  ) {}

  async create(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    userEmail?: string,
  ): Promise<Document> {
    try {
      // Read PDF to get metadata
      const pdfBuffer = await fs.readFile(file.path);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();

      const uploadedBy = userEmail || createDocumentDto.uploadedBy || 'anonymous';

      const document = new this.documentModel({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedBy,
      });

      return await document.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload document');
    }
  }

  async findOne(id: string): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async getFileBuffer(id: string): Promise<Buffer> {
    const document = await this.findOne(id);
    const uploadDir = this.configService.get<string>('upload.dir', './uploads');
    const filePath = path.join(process.cwd(), uploadDir, document.filename);
    
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new NotFoundException('Document file not found on disk');
    }
  }
} 