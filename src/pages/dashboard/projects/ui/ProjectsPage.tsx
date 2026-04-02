import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import { CreateProjectModal } from "@/features/create-project";
import { ManageSpheresModal } from "@/features/manage-spheres";
import { ImportProjectsModal } from "@/features/import-projects";
import { ClearProjectsButton } from "@/features/clear-projects";
import { ProjectsTable } from "@/widgets/projects-table";

export const ProjectsPage = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 lg:gap-6">
        <PageBreadCrumbs
          items={[
            { label: "Admin Panel" },
            { label: "Проекты", href: "/dashboard/projects" },
          ]}
        />
        <div className="flex items-center gap-3">
          <ClearProjectsButton />
          <ManageSpheresModal />
          <ImportProjectsModal />
          <CreateProjectModal />
        </div>
      </div>

      <ProjectsTable />
    </>
  );
};
