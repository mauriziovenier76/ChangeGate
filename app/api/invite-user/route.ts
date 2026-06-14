import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, nome, utente_id } = await req.json();

  if (!email || !nome || !utente_id) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  // Serve la service_role key — solo lato server, mai esposta al browser
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Invita l'utente: Supabase invia email con magic link per impostare la password
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { nome, utente_id },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Collega auth_user_id all'utente in cg_utenti
  await supabaseAdmin
    .from("cg_utenti")
    .update({ auth_user_id: data.user.id })
    .eq("id", utente_id);

  return NextResponse.json({ success: true });
}
