import { caseQueries } from "@/entities/case";
import { CreateCaseModal } from "@/features/create-case";
import { PAGE_LIMIT } from "@/shared/constants/pagination.constants";
import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import { PagePagination } from "@/shared/ui/page-pagination";
import { CasesList } from "@/widgets/cases-list";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

export const CasesPage = () => {
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data } = useQuery(
    caseQueries.list({
      page: currentPage,
      limit: PAGE_LIMIT,
    }),
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 lg:gap-6">
        <PageBreadCrumbs
          items={[
            { label: "Admin Panel" },
            {
              label: "Кейсы",
              href: "/dashboard/cases",
            },
          ]}
        />

        <CreateCaseModal />
      </div>

      <div className="flex flex-col gap-6 lg:gap-8">
        <CasesList list={data?.items} />

        <PagePagination
          className="w-max"
          totalCount={data?.meta.total || 0}
          pageSize={data?.meta.limit || PAGE_LIMIT}
          currentPage={data?.meta.page || 1}
        />
      </div>
    </>
  );
};
