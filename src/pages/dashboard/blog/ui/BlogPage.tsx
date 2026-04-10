import { PostsTable } from "@/widgets/posts-table";
import { BookOpen } from "lucide-react";

export const BlogPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Блог</h1>
          <p className="text-sm text-muted-foreground">Управление статьями и публикациями</p>
        </div>
      </div>
      <PostsTable />
    </div>
  );
};
