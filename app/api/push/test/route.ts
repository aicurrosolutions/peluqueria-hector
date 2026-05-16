import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { enviarPushTest } from "@/lib/push";

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const result = await enviarPushTest();
  if (result === null) {
    return NextResponse.json(
      { error: "Push no configurado — verificá VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en las variables de entorno" },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}
