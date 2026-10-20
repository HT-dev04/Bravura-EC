import { NoticiasClient } from "./NoticiasClient";
import { getCmsData } from "@/lib/cms-store";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const { news } = await getCmsData();
  return <NoticiasClient items={news} />;
}
