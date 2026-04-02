import { PageBreadCrumbs } from "@/shared/ui/page-breadcrumbs";
import { CreateReviewModal } from "@/features/create-review";
import { ReviewsTable } from "@/widgets/reviews-table";

export const ReviewsPage = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 lg:gap-6">
        <PageBreadCrumbs
          items={[
            { label: "Admin Panel" },
            { label: "Отзывы", href: "/dashboard/reviews" },
          ]}
        />
        <div className="flex items-center gap-3">
          <CreateReviewModal />
        </div>
      </div>

      <ReviewsTable />
    </>
  );
};
