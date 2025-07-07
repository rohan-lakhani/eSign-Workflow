import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ConfigService } from '@nestjs/config';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    getFileBuffer: jest.fn(),
  };

  const mockDocument = {
    _id: '507f1f77bcf86cd799439011',
    filename: 'test.pdf',
    originalName: 'test.pdf',
    size: 1024,
    status: 'uploaded',
    uploadedBy: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const mockFile = {
        filename: 'test.pdf',
        originalname: 'test.pdf',
        size: 1024,
        mimetype: 'application/pdf',
        path: '/tmp/test.pdf',
      } as Express.Multer.File;

      const mockPdfBuffer = Buffer.from('PDF content');
      mockDocumentsService.create.mockResolvedValue(mockDocument);
      mockDocumentsService.getFileBuffer.mockResolvedValue(mockPdfBuffer);

      const result = await controller.uploadDocument(
        mockFile,
        { uploadedBy: 'test@example.com' },
        {} as any,
      );

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document.id).toBe(mockDocument._id);
      expect(mockDocumentsService.create).toHaveBeenCalledWith(
        mockFile,
        { uploadedBy: 'test@example.com' },
        undefined,
      );
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      await expect(
        controller.uploadDocument(null as any, {}, {} as any),
      ).rejects.toThrow('No file uploaded');
    });
  });
}); 