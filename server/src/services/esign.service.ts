import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ESignService {
  constructor() {}

  async uploadDocument(pdfBuffer: Buffer, filename: string) {    
    return {
      success: true,
      documentId: `doc-${uuidv4()}`,
      filename,
      size: pdfBuffer.length,
      uploadedAt: new Date().toISOString(),
    };
  }

  async createSignatureRequest(
    documentId: string,
    signers: any[],
  ) {
    return {
      success: true,
      requestId: `req-${uuidv4()}`,
      documentId,
      signers: signers.map((signer, index) => ({
        ...signer,
        signerId: `signer-${index + 1}`,
        status: 'pending',
      })),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
} 