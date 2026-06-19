import { requireUser } from "@/lib/auth";
import { CreateDreamForm } from "@/components/dreams/create-dream-form";

export default async function CreatePage() {
  await requireUser();
  return <CreateDreamForm />;
}
