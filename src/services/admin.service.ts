import { apiClient } from '../api/client';

export interface AdminKPIs {
  totalTeachers: number;
  activeSubscriptions: number;
  totalRevenueXOF: number;
  totalLessons: number;
  publishedLessons: number;
  totalViews: number;
}

export interface AdminUserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  primaryLevelId?: { id: string; code: string; label: string };
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
}

export interface ImportBatchSummary {
  id: string;
  batchName: string;
  totalFiles: number;
  processedFiles: number;
  successfulFiles: number;
  failedFiles: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  files: Array<{
    fileName: string;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
  }>;
}

export class AdminService {
  public static async getKPIs(): Promise<AdminKPIs> {
    const res = await apiClient.get('/admin/dashboard/kpis');
    return res.data?.data;
  }

  public static async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ users: AdminUserItem[]; pagination: any }> {
    const res = await apiClient.get('/admin/users', { params });
    return {
      users: res.data?.data,
      pagination: res.data?.pagination,
    };
  }

  public static async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/status`, { status });
  }

  public static async updateUserLevel(
    userId: string,
    primaryLevelId: string
  ): Promise<void> {
    await apiClient.patch(`/admin/users/${userId}/level`, { primaryLevelId });
  }

  public static async uploadBatch(
    files: File[],
    options?: { primaryLevelId?: string; subjectId?: string }
  ): Promise<ImportBatchSummary> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (options?.primaryLevelId) {
      formData.append('primaryLevelId', options.primaryLevelId);
    }
    if (options?.subjectId) {
      formData.append('subjectId', options.subjectId);
    }

    const res = await apiClient.post('/admin/imports/upload', formData, {
      timeout: 120000,
    });
    return res.data?.data;
  }

  public static async getBatches(): Promise<ImportBatchSummary[]> {
    try {
      const res = await apiClient.get('/admin/imports');
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch {
      return [];
    }
  }

  public static async publishLesson(lessonId: string): Promise<void> {
    await apiClient.patch(`/admin/lessons/${lessonId}/publish`);
  }

  public static async archiveLesson(lessonId: string): Promise<void> {
    await apiClient.patch(`/admin/lessons/${lessonId}/archive`);
  }
}
