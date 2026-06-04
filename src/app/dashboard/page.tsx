import DashboardWorkspace from "@/components/DashboardWorkspace";

export const dynamic = "force-static";
export const revalidate = false;

export default function DashboardPage() {
  return <DashboardWorkspace />;
}
