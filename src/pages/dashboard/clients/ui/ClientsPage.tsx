import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";

export const ClientsPage = () => {
  return (
    <>
      <PageBreadCrumbs
        items={[
          { label: "Admin Panel" },
          {
            label: "Клиенты",
            href: "/dashboard/clients",
          },
        ]}
      />
    </>
  );
};
