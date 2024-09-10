import type { MetaFunction } from "@remix-run/node";
import App from "~/components/app";
import { Suspense } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Temperature Analyzer" },
    { name: "description", content: "Temperature Analyzer" },
  ];
};

export default function Index() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  )
}
