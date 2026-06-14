import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, nome } = await req.json();
  if (!email || !password || !nome) return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Crea utente in auth.users
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Crea record in cg_utenti
  await supabaseAdmin.from("cg_utenti").insert({
    nome, email, ruolo: "admin", attivo: true,
    avatar_iniziali: nome.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    avatar_bg: "#2563eb", avatar_colore: "#ffffff",
    auth_user_id: data.user.id,
  });

  return NextResponse.json({ success: true });
}
