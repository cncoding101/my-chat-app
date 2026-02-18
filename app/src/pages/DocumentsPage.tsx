import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchDocuments,
  uploadDocument,
  ingestURL,
  deleteDocument,
} from '@/api/documents';
import type { DocumentResponse } from '@/api/documents';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

const ACCEPTED_TYPES = '.pdf,.txt,.md,.markdown,.csv,.json,.xml,.yaml,.yml,.html,.htm';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    pdf: 'PDF',
    markdown: 'Markdown',
    text: 'Text',
    html: 'HTML',
    web: 'Web',
  };
  return labels[type] ?? type;
};

export const DocumentsPage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlValue, setUrlValue] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const urlMutation = useMutation({
    mutationFn: ingestURL,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUrlValue('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadMutation.mutate(file);
  };

  const handleURLSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlValue.trim()) urlMutation.mutate(urlValue.trim());
  };

  const isIngesting = uploadMutation.isPending || urlMutation.isPending;

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-6 overflow-y-auto">
      <Text variant="heading">Knowledge Base</Text>
      <Text variant="paragraph" className="text-gray-500">
        Upload documents to build your knowledge base. The agent will search
        these when answering questions.
      </Text>

      {/* Upload area */}
      <div
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {isIngesting ? (
          <>
            <LoadingSpinner />
            <Text variant="label" className="text-gray-500">
              Processing document...
            </Text>
          </>
        ) : (
          <>
            <Icon
              variant={{ type: 'outlined', icon: 'upload' }}
              size="2.5rem"
              className="text-gray-400"
            />
            <Text variant="label" className="text-gray-600">
              Drop a file here or click to upload
            </Text>
            <Text variant="paragraph" className="text-xs text-gray-400">
              PDF, TXT, Markdown, CSV, JSON, XML, HTML
            </Text>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* URL ingestion */}
      <form onSubmit={handleURLSubmit} className="flex gap-2">
        <input
          type="url"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          placeholder="https://example.com/article"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          disabled={isIngesting}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={!urlValue.trim() || isIngesting}
        >
          Ingest URL
        </Button>
      </form>

      {/* Error messages */}
      {uploadMutation.isError && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          Upload failed: {uploadMutation.error.message}
        </div>
      )}
      {urlMutation.isError && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          URL ingestion failed: {urlMutation.error.message}
        </div>
      )}

      {/* Document list */}
      <div className="flex flex-col gap-1">
        <Text variant="subHeading" className="mb-2">
          Documents ({documents.length})
        </Text>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No documents ingested yet
          </div>
        ) : (
          documents.map((doc: DocumentResponse) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.filename}</p>
                <p className="text-xs text-gray-400">
                  {typeLabel(doc.type)} &middot; {doc.chunkCount} chunks
                  &middot; {formatDate(doc.createdAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteMutation.mutate(doc.id)}
                disabled={deleteMutation.isPending}
              >
                <Icon
                  variant={{ type: 'outlined', icon: 'delete' }}
                  size="1.1rem"
                  className="text-gray-400 hover:text-red-500"
                />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
