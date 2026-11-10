
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function PrepareShipmentPage() {
  await requireUser();

  redirect("/account/warehouse");
}
