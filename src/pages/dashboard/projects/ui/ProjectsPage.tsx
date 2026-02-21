import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";

export const ProjectsPage = () => {
  return (
    <>
      <PageBreadCrumbs
        items={[
          { label: "Admin Panel" },
          {
            label: "Проекты",
            href: "/dashboard/projects",
          },
        ]}
      />
    </>
  );
};
