import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/utils/helpers/cn';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export const textareaVariants = tv({
  base: 'h-full',
  variants: {
    variant: {
      default:
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      chat: 'w-full resize-none overflow-y-auto wrap-break-word border-none p-1 focus:outline-none focus-visible:outline-none field-sizing-content',
    },
  },
});

export type TextareaVariant = VariantProps<typeof textareaVariants>['variant'];

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant: TextareaVariant;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ variant = 'default', className, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(textareaVariants({ variant }), className)}
        {...rest}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
