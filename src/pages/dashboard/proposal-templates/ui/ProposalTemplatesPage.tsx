import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/shared/ui/breadcrumb";
import { CreateProposalTemplateModal } from "@/features/create-proposal-template";
import { ProposalTemplatesTable } from "@/widgets/proposal-templates-table";

export const ProposalTemplatesPage = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Шаблоны откликов</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Шаблоны откликов</h1>
          <p className="text-sm text-muted-foreground">
            Готовые тексты для быстрого отклика на задачи биржи фриланса
          </p>
        </div>
        <CreateProposalTemplateModal />
      </div>

      <ProposalTemplatesTable />
    </div>
  );
};
