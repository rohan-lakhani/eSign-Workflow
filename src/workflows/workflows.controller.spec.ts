import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { ConfigService } from '@nestjs/config';
import { RoleAuthGuard } from '../auth/guards/role-auth.guard';

describe('WorkflowsController', () => {
  let controller: WorkflowsController;
  let service: WorkflowsService;

  const mockWorkflowsService = {
    create: jest.fn(),
    submitForSigning: jest.fn(),
    signDocument: jest.fn(),
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-value'),
  };

  const mockWorkflow = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test Workflow',
    status: 'draft',
    currentRole: 1,
    roles: [
      { roleNumber: 1, email: 'role1@example.com', name: 'Role 1', status: 'pending' },
      { roleNumber: 2, email: 'role2@example.com', name: 'Role 2', status: 'pending' },
      { roleNumber: 3, email: null, name: 'Role 3', status: 'pending' },
    ],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowsController],
      providers: [
        {
          provide: WorkflowsService,
          useValue: mockWorkflowsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(RoleAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkflowsController>(WorkflowsController);
    service = module.get<WorkflowsService>(WorkflowsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWorkflow', () => {
    it('should create a workflow successfully', async () => {
      const createDto = {
        documentId: '507f1f77bcf86cd799439012',
        name: 'Test Workflow',
        roles: [
          { email: 'role1@example.com', name: 'Role 1' },
          { email: 'role2@example.com', name: 'Role 2' },
          { email: undefined, name: 'Role 3' },
        ],
      };

      mockWorkflowsService.create.mockResolvedValue(mockWorkflow);

      const result = await controller.createWorkflow(createDto, {} as any);

      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(mockWorkflowsService.create).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('submitWorkflow', () => {
    it('should submit workflow for signing', async () => {
      const submitDto = { useMockApi: true };
      const submittedWorkflow = { ...mockWorkflow, status: 'active' };

      mockWorkflowsService.submitForSigning.mockResolvedValue(submittedWorkflow);

      const result = await controller.submitWorkflow(mockWorkflow.id, submitDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Workflow submitted successfully');
      expect(mockWorkflowsService.submitForSigning).toHaveBeenCalledWith(
        mockWorkflow.id,
        submitDto,
      );
    });
  });

  describe('signDocument', () => {
    it('should sign document successfully', async () => {
      const signDto = { signature: 'test-signature' };
      const req = { roleAccess: { roleNumber: 1 } } as any;

      mockWorkflowsService.signDocument.mockResolvedValue({
        ...mockWorkflow,
        currentRole: 2,
      });

      const result = await controller.signDocument(mockWorkflow.id, signDto, req);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully signed as Role 1');
      expect(mockWorkflowsService.signDocument).toHaveBeenCalledWith(
        mockWorkflow.id,
        1,
        signDto,
      );
    });
  });

  describe('getWorkflow', () => {
    it('should return workflow details', async () => {
      mockWorkflowsService.findOne.mockResolvedValue(mockWorkflow);

      const result = await controller.getWorkflow(mockWorkflow.id);

      expect(result.success).toBe(true);
      expect(result.workflow).toBeDefined();
      expect(mockWorkflowsService.findOne).toHaveBeenCalledWith(mockWorkflow.id);
    });
  });
}); 