import { createElement, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/utils/helpers/cn';

type Variant = 'heading' | 'subHeading' | 'label' | 'paragraph';

const ELEMENTS: Record<Variant, string> = {
  heading: 'h1',
  subHeading: 'h2',
  label: 'label',
  paragraph: 'p',
};

const variants = tv({
  variants: {
    variant: {
      heading: 'text-2xl font-bold',
      subHeading: 'text-xl font-bold',
      label: 'text-sm font-medium',
      paragraph: 'text-base font-normal',
    },
  },
});

interface TextProps {
  variant: Variant;
  children: ReactNode;
  className?: string;
}

export const Text = ({ variant, children, className }: TextProps) => {
  return createElement(
    ELEMENTS[variant],
    { className: cn(variants({ variant }), className) },
    children,
  );
};
