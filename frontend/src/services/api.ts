import { Task, Proof, Match, User } from '../store/useStore';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Mock data for development
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Smart Contract Development',
    description: 'Develop a privacy-focused smart contract using Compact Language for a DeFi application.',
    requirements: ['Solidity/Compact Language', 'DeFi Experience', 'Zero-Knowledge Proofs'],
    budget: 5000,
    deadline: '2024-02-15',
    category: 'Development',
    status: 'open',
    ownerId: 'owner1',
    applicants: []
  },
  {
    id: '2',
    title: 'UI/UX Design for Privacy App',
    description: 'Design intuitive user interface for a privacy-first collaboration platform.',
    requirements: ['Figma', 'Privacy-focused Design', 'Web3 UX'],
    budget: 3000,
    deadline: '2024-02-20',
    category: 'Design',
    status: 'open',
    ownerId: 'owner2',
    applicants: []
  },
  {
    id: '3',
    title: 'ZK Proof Implementation',
    description: 'Implement zero-knowledge proof system for anonymous contribution verification.',
    requirements: ['Cryptography', 'ZK-SNARKs', 'Midnight.js'],
    budget: 7500,
    deadline: '2024-03-01',
    category: 'Research',
    status: 'open',
    ownerId: 'owner3',
    applicants: []
  }
];

const mockProofs: Proof[] = [];
const mockMatches: Match[] = [];

// API service class
class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API request failed, using mock data:', error);
      throw error;
    }
  }

  // Task endpoints
  async getTasks(): Promise<Task[]> {
    try {
      return await this.request<Task[]>('/tasks');
    } catch {
      // Return mock data when API is not available
      return new Promise(resolve => {
        setTimeout(() => resolve(mockTasks), 500);
      });
    }
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      return await this.request<Task>(`/tasks/${id}`);
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const task = mockTasks.find(t => t.id === id) || null;
          resolve(task);
        }, 300);
      });
    }
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      return await this.request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const newTask: Task = {
            ...task,
            id: `task_${Date.now()}`,
          };
          mockTasks.push(newTask);
          resolve(newTask);
        }, 500);
      });
    }
  }

  async getOwnerTasks(ownerId: string): Promise<Task[]> {
    try {
      return await this.request<Task[]>(`/tasks?ownerId=${ownerId}`);
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const ownerTasks = mockTasks.filter(t => t.ownerId === ownerId);
          resolve(ownerTasks);
        }, 300);
      });
    }
  }

  async getTaskApplications(taskId: string): Promise<Proof[]> {
    try {
      return await this.request<Proof[]>(`/tasks/${taskId}/applications`);
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          // Return mock applications/proofs for the task
          const applications = mockProofs.filter(p => p.taskId === taskId);
          resolve(applications);
        }, 300);
      });
    }
  }

  async getUserProofs(userId: string): Promise<Proof[]> {
    try {
      return await this.request<Proof[]>(`/proofs?userId=${userId}`);
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const userProofs = mockProofs.filter(p => p.contributorId === userId);
          resolve(userProofs);
        }, 300);
      });
    }
  }

  async applyToTask(taskId: string, contributorId: string): Promise<void> {
    try {
      await this.request(`/tasks/${taskId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ contributorId }),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const task = mockTasks.find(t => t.id === taskId);
          if (task && !task.applicants.includes(contributorId)) {
            task.applicants.push(contributorId);
          }
          resolve();
        }, 300);
      });
    }
  }

  // Proof endpoints
  async getProofs(contributorId?: string): Promise<Proof[]> {
    try {
      const endpoint = contributorId ? `/proofs?contributorId=${contributorId}` : '/proofs';
      return await this.request<Proof[]>(endpoint);
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const filtered = contributorId 
            ? mockProofs.filter(p => p.contributorId === contributorId)
            : mockProofs;
          resolve(filtered);
        }, 300);
      });
    }
  }

  async submitProof(proof: Omit<Proof, 'id' | 'timestamp' | 'verified'>): Promise<Proof> {
    try {
      return await this.request<Proof>('/proofs', {
        method: 'POST',
        body: JSON.stringify(proof),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const newProof: Proof = {
            ...proof,
            id: `proof_${Date.now()}`,
            timestamp: new Date().toISOString(),
            verified: false, // Will be verified by ZK proof server
          };
          mockProofs.push(newProof);
          resolve(newProof);
        }, 1000); // Simulate proof generation time
      });
    }
  }

  async verifyProof(proofId: string): Promise<boolean> {
    try {
      const result = await this.request<{ verified: boolean }>(`/proofs/${proofId}/verify`, {
        method: 'POST',
      });
      return result.verified;
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const proof = mockProofs.find(p => p.id === proofId);
          if (proof) {
            proof.verified = Math.random() > 0.2; // 80% success rate for demo
          }
          resolve(proof?.verified || false);
        }, 2000); // Simulate ZK proof verification time
      });
    }
  }

  // Match endpoints
  async getMatches(userId: string): Promise<Match[]> {
    try {
      return await this.request<Match[]>(`/matches?userId=${userId}`);
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const filtered = mockMatches.filter(m => 
            m.contributorId === userId || m.ownerId === userId
          );
          resolve(filtered);
        }, 300);
      });
    }
  }

  async createMatch(match: Omit<Match, 'id' | 'timestamp'>): Promise<Match> {
    try {
      return await this.request<Match>('/matches', {
        method: 'POST',
        body: JSON.stringify(match),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const newMatch: Match = {
            ...match,
            id: `match_${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          mockMatches.push(newMatch);
          resolve(newMatch);
        }, 300);
      });
    }
  }

  async updateMatch(matchId: string, updates: Partial<Match>): Promise<Match> {
    try {
      return await this.request<Match>(`/matches/${matchId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const match = mockMatches.find(m => m.id === matchId);
          if (match) {
            Object.assign(match, updates);
            resolve(match);
          } else {
            throw new Error('Match not found');
          }
        }, 300);
      });
    }
  }

  // User/Wallet endpoints
  async connectWallet(address: string): Promise<User> {
    try {
      return await this.request<User>('/auth/wallet', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: address }),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const user: User = {
            id: `user_${Date.now()}`,
            walletAddress: address,
            role: null,
            isAnonymous: true,
            reputation: 0,
          };
          resolve(user);
        }, 500);
      });
    }
  }

  async updateUserRole(userId: string, role: 'contributor' | 'project_owner'): Promise<User> {
    try {
      return await this.request<User>(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          // Mock user update
          const user: User = {
            id: userId,
            role,
            isAnonymous: true,
            reputation: 0,
          };
          resolve(user);
        }, 300);
      });
    }
  }

  // Identity and consent methods
  async revealIdentity(matchId: string, type: 'contributor' | 'owner'): Promise<void> {
    try {
      await this.request(`/matches/${matchId}/reveal`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const match = mockMatches.find(m => m.id === matchId);
          if (match) {
            if (type === 'contributor') {
              match.contributorRevealed = true;
            } else {
              match.ownerRevealed = true;
            }
          }
          resolve();
        }, 300);
      });
    }
  }

  async grantMutualConsent(matchId: string): Promise<void> {
    try {
      await this.request(`/matches/${matchId}/consent`, {
        method: 'POST',
      });
    } catch {
      return new Promise(resolve => {
        setTimeout(() => {
          const match = mockMatches.find(m => m.id === matchId);
          if (match) {
            match.mutualConsent = true;
            match.status = 'active';
          }
          resolve();
        }, 300);
      });
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for convenience
export type { Task, Proof, Match, User };