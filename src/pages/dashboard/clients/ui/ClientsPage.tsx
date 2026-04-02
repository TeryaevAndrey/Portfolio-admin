import { CreateClientModal } from "@/features/create-client";
import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import { ClientsTable } from "@/widgets/clients-table";

export const ClientsPage = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 lg:gap-6">
        <PageBreadCrumbs
          items={[
            { label: "Admin Panel" },
            {
              label: "Клиенты",
              href: "/dashboard/clients",
            },
          ]}
        />
        <CreateClientModal />
      </div>

      <ClientsTable />
    </>
  );
};
