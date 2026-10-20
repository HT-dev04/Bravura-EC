import { ElencoClient } from "./ElencoClient";
import { getCmsData } from "@/lib/cms-store";

export const dynamic = "force-dynamic";

export default async function ElencoPage() {
  const { players } = await getCmsData();
  return <ElencoClient roster={players} />;
}
