import { GaleriaClient } from "./GaleriaClient";
import { getCmsData } from "@/lib/cms-store";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const { gallery } = await getCmsData();
  return <GaleriaClient items={gallery} />;
}
