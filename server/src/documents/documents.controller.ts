import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userEmail = (req as any).user?.email;
    const document = await this.documentsService.create(
      file,
      createDocumentDto,
      userEmail,
    );

    // // Get page count from PDF
    // const pdfBuffer = await this.documentsService.getFileBuffer((document as any)._id);
    // const { PDFDocument } = await import('pdf-lib');
    // const pdfDoc = await PDFDocument.load(pdfBuffer);
    // const pageCount = pdfDoc.getPageCount();

    return {
      success: true,
      document: {
        id: (document as any)._id,
        filename: document.filename,
        originalName: document.originalName,
        // size: document.size,
        // pageCount,
        status: document.status,
        createdAt: (document as any).createdAt,
      },
    };
  }

  @Get(':documentId/preview')
  async previewDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(documentId);
    const fileBuffer = await this.documentsService.getFileBuffer(documentId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${document.originalName}"`,
      'Cache-Control': 'public, max-age=3600',
    });

    res.send(fileBuffer);
  }

  @Get(':documentId/download')
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(documentId);
    const fileBuffer = await this.documentsService.getFileBuffer(documentId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
      'Content-Length': document.size.toString(),
    });

    res.send(fileBuffer);
  }
} 