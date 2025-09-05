import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

import { cn } from "@/utils";

const cardVariants = cva("rounded-xl border transition-all duration-300", {
  variants: {
    variant: {
      default:
        "bg-white border-slate-200 shadow-soft hover:shadow-medium dark:bg-slate-900 dark:border-slate-700",
      outline:
        "border-2 border-primary-200 bg-white dark:border-primary-800 dark:bg-slate-900",
      ghost:
        "border-transparent bg-slate-50 hover:bg-white hover:border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-900 dark:hover:border-slate-700",
      elevated:
        "bg-white border-slate-200 shadow-large hover:shadow-xl-soft dark:bg-slate-900 dark:border-slate-700",
      glass:
        "backdrop-blur-md bg-white/80 border-white/20 dark:bg-slate-900/80 dark:border-white/10",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    },
    hover: {
      none: "",
      lift: "hover:-translate-y-1",
      scale: "hover:scale-105",
      glow: "hover:shadow-glow",
    },
    interactive: {
      true: "cursor-pointer transform active:scale-95",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    hover: "none",
    interactive: false,
  },
});

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3 pb-0",
      md: "p-4 pb-0",
      lg: "p-6 pb-0",
      xl: "p-8 pb-0",
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

const cardContentVariants = cva("", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3 pt-0",
      md: "p-4 pt-0",
      lg: "p-6 pt-0",
      xl: "p-8 pt-0",
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

const cardFooterVariants = cva("flex items-center", {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3 pt-0",
      md: "p-4 pt-0",
      lg: "p-6 pt-0",
      xl: "p-8 pt-0",
    },
  },
  defaultVariants: {
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, hover, interactive, className })
      )}
      {...props}
    />
  )
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding, className }))}
      {...props}
    />
  )
);

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100",
      className
    )}
    {...props}
  />
));

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-600 dark:text-slate-400", className)}
    {...props}
  />
));

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding, className }))}
      {...props}
    />
  )
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ padding, className }))}
      {...props}
    />
  )
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
