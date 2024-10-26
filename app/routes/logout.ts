import { logOut } from "@/auth";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const payload = await request.formData();
  const sourceUrl: string | null = payload.get("from") as string;

  return await logOut(sourceUrl);
}
