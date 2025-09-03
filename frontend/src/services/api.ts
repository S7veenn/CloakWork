import { Task, Proof, Match, User } from '../store/useStore';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// API service class
class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`API request timeout after ${API_TIMEOUT}ms`);
      }
      throw error;
    }
  }

  // Task endpoints
  async getTasks(): Promise<Task[]> {
    return await this.request<Task[]>('/tasks');
  }

  async getTask(id: string): Promise<Task | null> {
    return await this.request<Task>(`/tasks/${id}`);
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    return await this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async getOwnerTasks(ownerId: string): Promise<Task[]> {
    return await this.request<Task[]>(`/tasks?ownerId=${ownerId}`);
  }

  async getTaskApplications(taskId: string): Promise<Proof[]> {
    return await this.request<Proof[]>(`/tasks/${taskId}/applications`);
  }

  async getUserProofs(userId: string): Promise<Proof[]> {
    return await this.request<Proof[]>(`/proofs?userId=${userId}`);
  }

  async applyToTask(taskId: string, contributorId: string): Promise<void> {
    await this.request(`/tasks/${taskId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ contributorId }),
    });
  }

  // Proof endpoints
  async getProofs(contributorId?: string): Promise<Proof[]> {
    const endpoint = contributorId ? `/proofs?contributorId=${contributorId}` : '/proofs';
    return await this.request<Proof[]>(endpoint);
  }

  async submitProof(proof: any): Promise<any> {
    return await this.request('/proofs', {
      method: 'POST',
      body: JSON.stringify(proof),
    });
  }

  async verifyProof(proofId: string): Promise<boolean> {
    const result = await this.request<{ verified: boolean }>(`/proofs/${proofId}/verify`, {
      method: 'POST',
    });
    return result.verified;
  }

  // Match endpoints
  async getMatches(userId: string): Promise<Match[]> {
    return await this.request<Match[]>(`/matches?userId=${userId}`);
  }

  async createMatch(match: Omit<Match, 'id' | 'timestamp'>): Promise<Match> {
    return await this.request<Match>('/matches', {
      method: 'POST',
      body: JSON.stringify(match),
    });
  }

  async updateMatch(matchId: string, updates: Partial<Match>): Promise<Match> {
    return await this.request<Match>(`/matches/${matchId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // User/Wallet endpoints
  async connectWallet(address: string): Promise<User> {
    return await this.request<User>('/auth/wallet', {
      method: 'POST',
      body: JSON.stringify({ walletAddress: address }),
    });
  }

  async updateUserRole(userId: string, role: 'contributor' | 'project_owner'): Promise<User> {
    return await this.request<User>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Identity and consent methods
  async revealIdentity(matchId: string, type: 'contributor' | 'owner'): Promise<void> {
    await this.request(`/matches/${matchId}/reveal`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async grantMutualConsent(matchId: string): Promise<void> {
    await this.request(`/matches/${matchId}/consent`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for convenience
export type { Task, Proof, Match, User };