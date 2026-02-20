import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../model/useTheme";

export const ThemeButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      title={
        theme === "light" ? "Включить темную тему" : "Включить светлую тему"
      }
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
};
