
export interface BaseAtViewModel {
  createdAt: string;
  updatedAt: string;
}

export interface BaseViewModel extends BaseAtViewModel {
  id: string;
}

export interface Toast {
  type: 'info' | 'warning' | 'error' | 'success';
  icon?: string;
  title: string;
  ttl?: number;
}
