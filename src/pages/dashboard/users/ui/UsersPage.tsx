
import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import { UsersTable } from "@/widgets/users-table";

export const UsersPage = () => {
  return (
    <>
      <PageBreadCrumbs
        items={[
          { label: "Admin Panel" },
          {
            label: "Пользователи",
            href: "/dashboard/users",
          },
        ]}
      />

      <UsersTable />
    </>
  );
};
