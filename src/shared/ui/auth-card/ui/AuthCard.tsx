import type { HTMLAttributes, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../card";

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children?: ReactNode;
}

export const AuthCard = ({ title, children }: Props) => {
  return (
    <Card className="max-w-sm sm:min-w-sm">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
