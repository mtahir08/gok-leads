import { IDocument } from '../types';
import { instance } from '../utils/axiosInstance';

export const fetchDocuments = async (searchQuery?: string): Promise<IDocument[]> => {
  try {
    const params = searchQuery ? { search: searchQuery } : {};
    const response = await instance.get('/api/documents', { params });
    const raw = response.data?.data ?? response.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error('Error fetching documents: ', error);
    return [];
  }
};

export const createDocument = async (data: Partial<IDocument>): Promise<IDocument> => {
  try {
    const response = await instance.post('/api/documents', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating document: ', error);
    throw error;
  }
};

export const updateDocument = async (id: string, data: Partial<IDocument>): Promise<IDocument> => {
  try {
    const response = await instance.put(`/api/documents/${id}`, data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await instance.delete(`/api/documents/${id}`);
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};
