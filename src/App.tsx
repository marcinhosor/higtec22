import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold">HigTec</h1>
            <p className="mt-2 text-gray-500">Projeto restaurando... Reconecte o GitHub para restaurar todos os arquivos.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
