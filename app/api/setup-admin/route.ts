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

  // Prova a creare l'utente; se esiste già recupera l'ID
  let authUserId: string | null = null;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already") || error.status === 500) {
      // Cerca l'utente esistente
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === email);
      if (!existing) {
        console.log("Auth error full:", JSON.stringify(error));
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      authUserId = existing.id;
      // Aggiorna la password
      await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
    } else {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else {
    authUserId = data.user.id;
  }

  // Crea record in cg_utenti
  await supabaseAdmin.from("cg_utenti").insert({
    nome, email, ruolo: "admin", attivo: true,
    avatar_iniziali: nome.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    avatar_bg: "#2563eb", avatar_colore: "#ffffff",
    auth_user_id: authUserId,
  });

  return NextResponse.json({ success: true });
}
