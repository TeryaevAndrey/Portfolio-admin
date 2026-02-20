"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbStep {
  label: string;
  href?: string;
}

interface PageBreadCrumbsProps {
  items?: BreadcrumbStep[];
  autoGenerate?: boolean;
}

export function PageBreadCrumbs({
  items,
  autoGenerate = false,
}: PageBreadCrumbsProps) {
  const { pathname } = useLocation();

  const breadcrumbs: BreadcrumbStep[] = React.useMemo(() => {
    if (items) return items;
    if (!autoGenerate) return [];

    const segments = pathname.split("/").filter(Boolean);
    return [
      { label: "Главная", href: "/" },
      ...segments.map((segment: string, index: number) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const label =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        return { label, href };
      }),
    ];
  }, [items, autoGenerate, pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={item.href || index}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
