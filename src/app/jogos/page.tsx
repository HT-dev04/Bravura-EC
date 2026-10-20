import { JogosClient } from "./JogosClient";
import { getCmsData } from "@/lib/cms-store";

export const dynamic = "force-dynamic";

export default async function JogosPage() {
  const { matches } = await getCmsData();
  return <JogosClient list={matches} />;
}
