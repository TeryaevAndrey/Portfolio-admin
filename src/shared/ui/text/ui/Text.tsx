import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes, type JSX } from "react";

export const textVariants = cva("", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm", 
      md: "text-md",
      default: "text-sm md:text-base",
      xl: "text-xl",
      "3xl": "text-3xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    color: {
      foreground: "text-foreground",
      mutedForeground: "text-muted-foreground",
      white: "text-white"
    },
    fontStyle: {
      italic: "italic", 
      notItalic: "not-italic"
    }
  },
  defaultVariants: {
    size: "default",
    weight: "normal",
    color: "foreground",
    fontStyle: "notItalic"
  },
});

type Tag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";

export type Props<T extends Tag = "p"> = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    tag?: Tag;
  } & JSX.IntrinsicElements[T];

export const Text = ({
  className,
  children,
  tag,
  size,
  color,
  weight,
  ...props
}: Props) => {
  const Component = tag || "p";

  return (
    <Component
      className={cn(textVariants({ size, color, weight }), className)}
      {...props}
    >
      {children}
    </Component>
  );
};
