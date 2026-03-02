import type { DocumentResponse } from '@/api/documents';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Text } from '@/components/atoms/Text';

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

const typeLabel = (type: string) => {
	const labels: Record<string, string> = {
		pdf: 'PDF',
		markdown: 'Markdown',
		text: 'Text',
		html: 'HTML',
		web: 'Web'
	};
	return labels[type] ?? type;
};

interface Props {
	documents: DocumentResponse[];
	isLoading: boolean;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

export const DocumentList = ({ documents, isLoading, onDelete, isDeleting }: Props) => {
	return (
		<div className="flex flex-col gap-1">
			<Text variant="subHeading" className="mb-2">
				Documents ({documents.length})
			</Text>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<LoadingSpinner />
				</div>
			) : documents.length === 0 ? (
				<Text variant="paragraph" color="muted" className="py-8 text-center text-sm">
					No documents ingested yet
				</Text>
			) : (
				documents.map((doc: DocumentResponse) => (
					<div
						key={doc.id}
						className="border-base-300 flex items-center justify-between rounded-lg border px-4 py-3"
					>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{doc.filename}</p>
							<p className="text-base-content-muted text-xs">
								{typeLabel(doc.type)} &middot; {doc.chunkCount} chunks &middot;{' '}
								{formatDate(doc.createdAt)}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => onDelete(doc.id)}
							disabled={isDeleting}
						>
							<Icon
								variant={{ type: 'outlined', icon: 'delete' }}
								size="1.1rem"
								className="text-base-content-muted hover:text-error"
							/>
						</Button>
					</div>
				))
			)}
		</div>
	);
};
