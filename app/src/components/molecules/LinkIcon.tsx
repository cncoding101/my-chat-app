import { Link } from 'react-router';
import { Icon, type IconVariant } from '@/components/atoms/Icon';
import { cn } from '@/utils/helpers/cn';
import type { ReactNode } from 'react';

interface LinkIconProps {
  to: string;
  icon: IconVariant;
  className?: string;
  children?: ReactNode;
}

export const LinkIcon = ({ to, icon, className, children }: LinkIconProps) => {
  return (
    <Link
      to={to}
      className={cn('flex items-center rounded-md px-3 py-2 text-sm font-medium', className)}
    >
      <span className="truncate">{children}</span>
      <Icon variant={icon} size="1rem" className="text-primary ml-2" />
    </Link>
  );
};
