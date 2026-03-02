import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDocuments, uploadDocument, ingestURL, deleteDocument } from '@/api/documents';
import { Text } from '@/components/atoms/Text';
import { IngestionUrl } from '@/components/molecules/IngestionUrl';
import { DocumentList } from '@/components/organisms/DocumentList';
import { Upload } from '@/components/organisms/Upload';

export const DocumentsPage = () => {
	const queryClient = useQueryClient();

	const { data: documents = [], isLoading } = useQuery({
		queryKey: ['documents'],
		queryFn: fetchDocuments
	});

	const uploadMutation = useMutation({
		mutationFn: uploadDocument,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] });
		},
		onError: () => {
			throw new Error('Failed to upload document');
		}
	});

	const urlMutation = useMutation({
		mutationFn: ingestURL,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] });
		},
		onError: () => {
			throw new Error('Failed to ingest URL');
		}
	});

	const deleteMutation = useMutation({
		mutationFn: deleteDocument,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] });
		},
		onError: () => {
			throw new Error('Failed to delete document');
		}
	});

	const isIngesting = uploadMutation.isPending || urlMutation.isPending;

	return (
		<div className="mx-auto flex h-full max-w-4xl flex-col gap-6 overflow-y-auto px-2">
			<Text variant="heading">Knowledge Base</Text>
			<Text variant="paragraph" color="muted">
				Upload documents to build your knowledge base. The agent will search these when answering
				questions.
			</Text>

			<Upload onUpload={(file) => uploadMutation.mutate(file)} isUploading={isIngesting} />

			<IngestionUrl onSubmit={(url) => urlMutation.mutate(url)} isLoading={isIngesting} />

			<DocumentList
				documents={documents}
				isLoading={isLoading}
				onDelete={(id) => deleteMutation.mutate(id)}
				isDeleting={deleteMutation.isPending}
			/>
		</div>
	);
};
