import { FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ContractsTable } from "@/widgets/contracts-table";
import { InvoicesTable } from "@/widgets/invoices-table";

const TABS = [
  { key: "contracts", label: "Договоры" },
  { key: "invoices", label: "Инвойсы" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabKey) ?? "contracts";

  const setTab = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Документы</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "contracts" && <ContractsTable />}
      {activeTab === "invoices" && <InvoicesTable />}
    </div>
  );
};
