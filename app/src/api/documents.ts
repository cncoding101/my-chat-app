export interface DocumentResponse {
  id: string;
  filename: string;
  type: string;
  status: string;
  chunkCount: number;
  createdAt: string;
}

export const fetchDocuments = async (): Promise<DocumentResponse[]> => {
  const res = await fetch('/api/documents');
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json() as Promise<DocumentResponse[]>;
};

export const uploadDocument = async (file: File): Promise<DocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/documents', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Upload failed');
  }

  return res.json() as Promise<DocumentResponse>;
};

export const ingestURL = async (url: string): Promise<DocumentResponse> => {
  const res = await fetch('/api/documents/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'URL ingestion failed');
  }

  return res.json() as Promise<DocumentResponse>;
};

export const deleteDocument = async (id: string): Promise<{ success: boolean }> => {
  const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json() as Promise<{ success: boolean }>;
};
