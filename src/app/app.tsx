import { Providers } from "@/app/providers";
import { Router } from "@/app/router";

export function App() {
  return (
    <Providers>
      <Router />
    </Providers>
  );
}
