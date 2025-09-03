import request from 'supertest';
import { createServer, resetStorage } from '../../src/server';
import { Application } from 'express';

describe('CloakWork API Server', () => {
  let app: Application;

  beforeAll(() => {
    app = createServer();
  });

  beforeEach(() => {
    resetStorage();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        version: '1.0.0'
      });
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task description',
        reward: 100,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        requirements: ['JavaScript', 'Node.js'],
        ownerId: 'owner123'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: taskData.title,
        description: taskData.description,
        reward: taskData.reward,
        deadline: taskData.deadline,
        requirements: taskData.requirements,
        ownerId: taskData.ownerId,
        status: 'open',
        timestamp: expect.any(String)
      });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidTaskData = {
        title: 'Test Task'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTaskData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid reward amount', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task description',
        reward: -10,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        requirements: ['JavaScript'],
        ownerId: 'owner123'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for past deadline', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task description',
        reward: 100,
        deadline: new Date(Date.now() - 86400000).toISOString(),
        requirements: ['JavaScript'],
        ownerId: 'owner123'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      const taskData1 = {
        title: 'Task 1',
        description: 'First test task',
        reward: 100,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        requirements: ['JavaScript'],
        ownerId: 'owner1'
      };

      const taskData2 = {
        title: 'Task 2',
        description: 'Second test task',
        reward: 200,
        deadline: new Date(Date.now() + 172800000).toISOString(),
        requirements: ['Python'],
        ownerId: 'owner2'
      };

      await request(app).post('/api/tasks').send(taskData1);
      await request(app).post('/api/tasks').send(taskData2);
    });

    it('should return list of tasks by default', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=open')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((task: any) => {
        expect(task.status).toBe('open');
      });
    });

    it('should filter tasks by owner', async () => {
      const response = await request(app)
        .get('/api/tasks?owner=owner1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((task: any) => {
        expect(task.ownerId).toBe('owner1');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?page=1&limit=1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(1);
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/tasks?page=-1&limit=0')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/tasks/:taskId/apply', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task description',
        reward: 100,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        requirements: ['JavaScript'],
        ownerId: 'owner123'
      };

      const taskResponse = await request(app)
        .post('/api/tasks')
        .send(taskData);
      
      taskId = taskResponse.body.id;
    });

    it('should create application with valid data', async () => {
      const applicationData = {
        contributorId: 'contributor123',
        proposal: 'I can complete this task efficiently',
        estimatedHours: 10
      };

      const response = await request(app)
        .post(`/api/tasks/${taskId}/apply`)
        .send(applicationData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        taskId: taskId,
        contributorId: applicationData.contributorId,
        proposal: applicationData.proposal,
        estimatedHours: applicationData.estimatedHours,
        status: 'pending',
        timestamp: expect.any(String)
      });
    });

    it('should return 404 for non-existent task', async () => {
      const applicationData = {
        contributorId: 'contributor123',
        proposal: 'I can complete this task efficiently',
        estimatedHours: 10
      };

      const response = await request(app)
        .post('/api/tasks/non-existent-task/apply')
        .send(applicationData)
        .expect(404);

      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('POST /api/proofs', () => {
    let taskId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task description',
        reward: 100,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        requirements: ['JavaScript'],
        ownerId: 'owner123'
      };

      const taskResponse = await request(app)
        .post('/api/tasks')
        .send(taskData);
      
      taskId = taskResponse.body.id;
    });

    it('should submit proof with valid data', async () => {
      const proofData = {
        taskId: taskId,
        contributorId: 'contributor123',
        type: 'completion',
        description: 'Task completed successfully',
        zkProof: 'mock_zk_proof_data'
      };

      const response = await request(app)
        .post('/api/proofs')
        .send(proofData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        taskId: proofData.taskId,
        contributorId: proofData.contributorId,
        type: proofData.type,
        description: proofData.description,
        zkProof: proofData.zkProof,
        timestamp: expect.any(String),
        verified: expect.any(Boolean)
      });
    });

    it('should return 404 for non-existent task', async () => {
      const proofData = {
        taskId: 'non-existent-task',
        contributorId: 'contributor123',
        type: 'completion',
        description: 'Task completed successfully',
        zkProof: 'mock_zk_proof_data'
      };

      const response = await request(app)
        .post('/api/proofs')
        .send(proofData)
        .expect(404);

      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /api/proofs', () => {
    it('should return list of proofs', async () => {
      const response = await request(app)
        .get('/api/proofs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/matches', () => {
    let taskId: string;
    let applicationId: string;

    beforeEach(async () => {
      const taskData = {
        title: 'Test Task',
        description: 'A test task description',
        reward: 100,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        requirements: ['JavaScript'],
        ownerId: 'owner123'
      };

      const taskResponse = await request(app)
        .post('/api/tasks')
        .send(taskData);
      
      taskId = taskResponse.body.id;

      const applicationData = {
        contributorId: 'contributor123',
        proposal: 'I can complete this task efficiently',
        estimatedHours: 10
      };

      const applicationResponse = await request(app)
        .post(`/api/tasks/${taskId}/apply`)
        .send(applicationData);
      
      applicationId = applicationResponse.body.id;
    });

    it('should create match with valid data', async () => {
      const matchData = {
        taskId: taskId,
        applicationId: applicationId,
        contributorId: 'contributor123',
        ownerId: 'owner123',
        contributorConsent: true
      };

      const response = await request(app)
        .post('/api/matches')
        .send(matchData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        taskId: matchData.taskId,
        contributorId: matchData.contributorId,
        ownerId: matchData.ownerId,
        status: 'mutual_consent',
        contributorRevealed: false,
        ownerRevealed: false,
        timestamp: expect.any(String)
      });
    });

    it('should return 404 for non-existent task', async () => {
      const matchData = {
        taskId: 'non-existent-task',
        applicationId: applicationId,
        contributorId: 'contributor123',
        ownerId: 'owner123',
        contributorConsent: true
      };

      const response = await request(app)
        .post('/api/matches')
        .send(matchData)
        .expect(404);

      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('GET /api/matches', () => {
    it('should return list of matches', async () => {
      const response = await request(app)
        .get('/api/matches')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/auth/wallet', () => {
    it('should authenticate wallet with valid signature', async () => {
      const authData = {
        walletAddress: '0x1234567890abcdef',
        signature: 'valid_signature_data',
        message: 'Authentication message'
      };

      const response = await request(app)
        .post('/api/auth/wallet')
        .send(authData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        userId: expect.any(String),
        walletAddress: authData.walletAddress,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidAuthData = {
        walletAddress: '0x1234567890abcdef'
        // Missing signature and message
      };

      const response = await request(app)
        .post('/api/auth/wallet')
        .send(invalidAuthData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });
});