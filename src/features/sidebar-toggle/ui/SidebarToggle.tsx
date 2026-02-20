import { Button } from "@/shared/ui/button";
import { useSidebar } from "@/shared/ui/sidebar"
import { PanelLeftDashed } from "lucide-react";

export const SidebarToggle = () => {
    const {toggleSidebar} = useSidebar();

    return(
        <Button variant="outline" size="icon-sm" onClick={toggleSidebar}>
            <PanelLeftDashed />
        </Button>
    )
}