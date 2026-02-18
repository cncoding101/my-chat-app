import { type VariantProps, tv } from 'tailwind-variants';
import { cn } from '@/utils/helpers/cn';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';

const variants = tv({
  base: 'rounded-sm focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-content shadow-xs hover:bg-primary/90',
      destructive:
        'bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white',
      outline:
        'bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border',
      secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
      ghost: '',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
      lg: 'h-10 px-6 has-[>svg]:px-4',
      icon: 'size-9',
      'icon-sm': 'size-8',
      'icon-lg': 'size-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export type ButtonVariant = VariantProps<typeof variants>['variant'];
export type ButtonSize = VariantProps<typeof variants>['size'];

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
  children?: ReactNode;
};

export type Props = ButtonProps | LinkButtonProps;

const isLink = (props: Props): props is LinkButtonProps => 'href' in props && !!props.href;

export const Button = (props: Props) => {
  const { variant = 'default', size = 'default', className, children, ...rest } = props;

  if (isLink(props)) {
    const { href, ...anchorRest } = rest as LinkButtonProps;
    const disabled = (rest as ButtonProps).disabled;
    return (
      <a
        data-slot="button"
        className={cn(variants({ variant, size }), className)}
        href={href}
        aria-disabled={disabled}
        role={disabled ? 'link' : undefined}
        tabIndex={disabled ? -1 : undefined}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const { type = 'button', disabled, ...buttonRest } = rest as ButtonProps;
  return (
    <button
      data-slot="button"
      className={cn(variants({ variant, size }), className)}
      type={type}
      disabled={disabled}
      {...buttonRest}
    >
      {children}
    </button>
  );
};
