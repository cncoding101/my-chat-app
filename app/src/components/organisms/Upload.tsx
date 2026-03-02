import { useRef, useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Text } from '@/components/atoms/Text';

const ACCEPTED_TYPES = '.pdf,.txt,.md,.markdown,.csv,.json,.xml,.yaml,.yml,.html,.htm';

interface Props {
	onUpload: (file: File) => void;
	isUploading: boolean;
}

export const Upload = ({ onUpload, isUploading }: Props) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragActive, setDragActive] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onUpload(file);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
		const file = e.dataTransfer.files[0];
		onUpload(file);
	};

	return (
		<div
			className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
				dragActive ? 'border-primary bg-info' : 'border-base-300 hover:border-base-content-muted'
			}`}
			onClick={() => fileInputRef.current?.click()}
			onDragOver={(e) => {
				e.preventDefault();
				setDragActive(true);
			}}
			onDragLeave={() => setDragActive(false)}
			onDrop={handleDrop}
		>
			{isUploading ? (
				<>
					<LoadingSpinner />
					<Text variant="label" color="muted">
						Processing document...
					</Text>
				</>
			) : (
				<>
					<Icon
						variant={{ type: 'outlined', icon: 'upload' }}
						size="2.5rem"
						className="text-base-content-muted"
					/>
					<Text variant="label" color="muted">
						Drop a file here or click to upload
					</Text>
					<Text variant="paragraph" color="muted" className="text-xs">
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
	);
};
