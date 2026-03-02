import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

interface Props {
	onSubmit: (url: string) => void;
	isLoading: boolean;
}

export const IngestionUrl = ({ onSubmit, isLoading }: Props) => {
	const [urlValue, setUrlValue] = useState('');

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (urlValue.trim()) {
			onSubmit(urlValue.trim());
			setUrlValue('');
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				type="url"
				value={urlValue}
				onChange={(e) => setUrlValue(e.target.value)}
				placeholder="https://example.com/article"
				className="flex-1 rounded-lg"
				disabled={isLoading}
			/>
			<Button type="submit" variant="outline" disabled={!urlValue.trim() || isLoading}>
				Ingest URL
			</Button>
		</form>
	);
};
