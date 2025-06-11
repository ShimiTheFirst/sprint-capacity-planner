import { Metadata } from "next";
import { Dashboard } from "~/components/custom/Dashboard";
import { Navigation } from "~/components/custom/Navigation";

export const metadata: Metadata = {
  title: "Dashboard | Sprint Capacity Planner",
  description:
    "Overview of sprint capacity planning metrics and workload distribution",
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of workload distribution across clients and team members
        </p>
      </div>

      <Dashboard />
    </div>
  );
}
