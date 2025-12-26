import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { User } from '../models/User';
import { Issue } from '../models/Issue';

/**
 * Integration Tests for Campus FixIt
 * Tests complete flows: auth, issue creation, admin management
 * Requirements: All requirements
 */

describe('Campus FixIt Integration Tests', () => {
  let studentToken: string;
  let adminToken: string;
  let studentId: string;
  let adminId: string;
  let issueId: string;

  // Connect to test database before all tests
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-fixit-test';
    await mongoose.connect(mongoUri);
  });

  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
    await Issue.deleteMany({});
  });

  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication Flow', () => {
    it('should register a new student', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.role).toBe('student');
      
      studentToken = response.body.data.token;
      studentId = response.body.data.user.id;
    });

    it('should login an existing user', async () => {
      // First register
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'password123',
        });

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should get user profile with valid token', async () => {
      // Register first
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'password123',
        });

      const token = registerResponse.body.data.token;

      // Get profile
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('student@test.com');
    });
  });

  describe('Issue Creation Flow', () => {
    beforeEach(async () => {
      // Register student
      const studentResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'password123',
        });

      studentToken = studentResponse.body.data.token;
      studentId = studentResponse.body.data.user.id;
    });

    it('should create an issue with valid data', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Broken Light',
          description: 'The light in room 101 is not working',
          category: 'Electrical',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Broken Light');
      expect(response.body.data.status).toBe('Open');
      expect(response.body.data.category).toBe('Electrical');
      
      issueId = response.body.data.id;
    });

    it('should reject issue without title', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          description: 'The light in room 101 is not working',
          category: 'Electrical',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject issue with invalid category', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Broken Light',
          description: 'The light in room 101 is not working',
          category: 'InvalidCategory',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should get student own issues', async () => {
      // Create an issue first
      await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Broken Light',
          description: 'The light in room 101 is not working',
          category: 'Electrical',
        });

      // Get student's issues
      const response = await request(app)
        .get('/api/issues/my')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Broken Light');
    });

    it('should filter issues by category', async () => {
      // Create multiple issues
      await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Broken Light',
          description: 'Electrical issue',
          category: 'Electrical',
        });

      await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Leaking Pipe',
          description: 'Water issue',
          category: 'Water',
        });

      // Filter by Electrical
      const response = await request(app)
        .get('/api/issues/my?category=Electrical')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('Electrical');
    });
  });

  describe('Admin Management Flow', () => {
    beforeEach(async () => {
      // Register student
      const studentResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'student@test.com',
          password: 'password123',
        });

      studentToken = studentResponse.body.data.token;
      studentId = studentResponse.body.data.user.id;

      // Create admin manually
      const adminUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      });

      adminId = adminUser._id.toString();

      // Login as admin
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      adminToken = adminLoginResponse.body.data.token;

      // Create an issue as student
      const issueResponse = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Broken Light',
          description: 'The light in room 101 is not working',
          category: 'Electrical',
        });

      issueId = issueResponse.body.data.id;
    });

    it('should allow admin to view all issues', async () => {
      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should reject student from viewing all issues', async () => {
      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow admin to update issue status', async () => {
      const response = await request(app)
        .patch(`/api/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'In Progress',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('In Progress');
    });

    it('should reject student from updating issue status', async () => {
      const response = await request(app)
        .patch(`/api/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          status: 'In Progress',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow admin to add remarks', async () => {
      const response = await request(app)
        .post(`/api/issues/${issueId}/remarks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          text: 'Working on this issue',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.remarks).toHaveLength(1);
      expect(response.body.data.remarks[0].text).toBe('Working on this issue');
    });

    it('should reject student from adding remarks', async () => {
      const response = await request(app)
        .post(`/api/issues/${issueId}/remarks`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          text: 'Trying to add remark',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should complete full admin workflow', async () => {
      // 1. Admin views all issues
      const allIssuesResponse = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(allIssuesResponse.status).toBe(200);
      expect(allIssuesResponse.body.data.length).toBeGreaterThan(0);

      // 2. Admin updates status to In Progress
      const updateStatusResponse = await request(app)
        .patch(`/api/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'In Progress',
        });

      expect(updateStatusResponse.status).toBe(200);
      expect(updateStatusResponse.body.data.status).toBe('In Progress');

      // 3. Admin adds a remark
      const addRemarkResponse = await request(app)
        .post(`/api/issues/${issueId}/remarks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          text: 'Electrician assigned',
        });

      expect(addRemarkResponse.status).toBe(200);
      expect(addRemarkResponse.body.data.remarks).toHaveLength(1);

      // 4. Admin resolves the issue
      const resolveResponse = await request(app)
        .patch(`/api/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Resolved',
        });

      expect(resolveResponse.status).toBe(200);
      expect(resolveResponse.body.data.status).toBe('Resolved');
      expect(resolveResponse.body.data.resolvedAt).toBeDefined();
    });
  });

  describe('Complete End-to-End Flow', () => {
    it('should complete full student and admin workflow', async () => {
      // 1. Student registers
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          password: 'password123',
        });

      expect(registerResponse.status).toBe(201);
      const studentToken = registerResponse.body.data.token;

      // 2. Student creates an issue
      const createIssueResponse = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'WiFi Not Working',
          description: 'Cannot connect to WiFi in library',
          category: 'Internet',
        });

      expect(createIssueResponse.status).toBe(201);
      const issueId = createIssueResponse.body.data.id;

      // 3. Student views their issues
      const myIssuesResponse = await request(app)
        .get('/api/issues/my')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(myIssuesResponse.status).toBe(200);
      expect(myIssuesResponse.body.data).toHaveLength(1);

      // 4. Create admin
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      });

      // 5. Admin logs in
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(adminLoginResponse.status).toBe(200);
      const adminToken = adminLoginResponse.body.data.token;

      // 6. Admin views all issues
      const allIssuesResponse = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(allIssuesResponse.status).toBe(200);
      expect(allIssuesResponse.body.data.length).toBeGreaterThan(0);

      // 7. Admin updates status
      const updateStatusResponse = await request(app)
        .patch(`/api/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'In Progress',
        });

      expect(updateStatusResponse.status).toBe(200);

      // 8. Admin adds remark
      const addRemarkResponse = await request(app)
        .post(`/api/issues/${issueId}/remarks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          text: 'IT team notified',
        });

      expect(addRemarkResponse.status).toBe(200);

      // 9. Student checks issue status
      const checkIssueResponse = await request(app)
        .get('/api/issues/my')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(checkIssueResponse.status).toBe(200);
      expect(checkIssueResponse.body.data[0].status).toBe('In Progress');
      expect(checkIssueResponse.body.data[0].remarks).toHaveLength(1);

      // 10. Admin resolves issue
      const resolveResponse = await request(app)
        .patch(`/api/issues/${issueId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Resolved',
        });

      expect(resolveResponse.status).toBe(200);
      expect(resolveResponse.body.data.status).toBe('Resolved');
    });
  });
});
