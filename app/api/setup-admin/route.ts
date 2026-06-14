import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, nome } = await req.json();
  if (!email || !password || !nome) return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  console.log("URL:", url?.slice(0, 50));
  console.log("KEY:", key?.slice(0, 20));

  const supabaseAdmin = createClient(url, key);

  // Crea utente in auth.users
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) {
    console.log("Auth error full:", JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Crea record in cg_utenti
  await supabaseAdmin.from("cg_utenti").insert({
    nome, email, ruolo: "admin", attivo: true,
    avatar_iniziali: nome.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    avatar_bg: "#2563eb", avatar_colore: "#ffffff",
    auth_user_id: data.user.id,
  });

  return NextResponse.json({ success: true });
}
