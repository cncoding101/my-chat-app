import type { InputHTMLAttributes } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/utils/helpers/cn';

export const inputVariants = tv({
	base: 'focus:ring-primary w-full rounded-md border p-2 px-4 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2'
});

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	className?: string;
}

export const Input = ({ className, ...rest }: InputProps) => {
	return <input data-slot="input" className={cn(inputVariants(), className)} {...rest} />;
};
