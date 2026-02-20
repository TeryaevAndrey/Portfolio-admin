import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { Routing } from "./routing";
import { Toaster } from "./shared/ui/sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routing />

      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
