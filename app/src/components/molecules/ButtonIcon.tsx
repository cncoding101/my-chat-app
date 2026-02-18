import { Button, type Props as ButtonProps } from '@/components/atoms/Button';
import { Icon, type IconVariant } from '@/components/atoms/Icon';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import type { ReactNode } from 'react';

interface ButtonIconProps {
  icon: { variant: IconVariant; className?: string; size?: string };
  button: ButtonProps;
  children?: ReactNode;
  isLoading?: boolean;
}

export const ButtonIcon = ({ icon, button, children, isLoading = false }: ButtonIconProps) => {
  return (
    <Button {...button}>
      {children}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Icon variant={icon.variant} className={icon.className} size={icon.size} />
      )}
    </Button>
  );
};
