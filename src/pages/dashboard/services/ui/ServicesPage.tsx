import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/shared/ui/breadcrumb";
import { CreateServiceModal } from "@/features/create-service";
import { ServicesTable } from "@/widgets/services-table";

export const ServicesPage = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Услуги</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Услуги</h1>
        </div>
        <CreateServiceModal />
      </div>

      <ServicesTable />
    </div>
  );
};
