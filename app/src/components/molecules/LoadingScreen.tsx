import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Text } from '@/components/atoms/Text';

interface LoadingScreenProps {
  title?: string;
}

export const LoadingScreen = ({ title = 'Loading your workspace...' }: LoadingScreenProps) => {
  return (
    <div className="bg-base-100 fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner className="text-primary size-12" />
        <Text variant="label" className="text-primary animate-pulse">
          {title}
        </Text>
      </div>
    </div>
  );
};
