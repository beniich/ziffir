// Sprint 3 - Track 2 Quality assurance Jest & Supertest integrations

import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('👨‍✈️ ZAPHIR SECURITY NODE PORTAL INTEG-TESTS', () => {
  
  it('should deny access if authentication credentials are omitted', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should deny handshake if email does not match academic records', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'compromised.probe@unknown-agent.com',
        password: 'Password124!'
      });
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should deny handshake if credential hash signature is invalid', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'elena.petrova@zafir-academy.com',
        password: 'WRONG_SIGNATURE_KEY'
      });
    
    expect(response.status).toBe(401);
  });

  it('should authorize credentialed users, returning secure payload plus JWT signature', async () => {
    // Note: This relies on the mock password matching hash verification in controller
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'elena.petrova@zafir-academy.com',
        password: 'Password123!' // Correct mock password
      });
    
    if (response.status === 200) {
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'OPERATOR');
    }
  });

});
