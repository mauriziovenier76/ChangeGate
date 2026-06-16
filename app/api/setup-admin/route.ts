import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, nome, action } = await req.json();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Reset password per utente esistente ──
  if (action === "reset") {
    // Cerca l'utente direttamente nel db auth
    const { data: userData, error: findError } = await supabaseAdmin
      .rpc('get_user_id_by_email', { email_input: email });

    if (findError || !userData) {
      // Fallback: prova listUsers con paginazione
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      console.log("Total users found:", list?.users?.length);
      console.log("Users:", list?.users?.map(u => u.email));
      const existing = list?.users?.find((u) => u.email === email);
      if (!existing) return NextResponse.json({ error: `Utente non trovato. Trovati ${list?.users?.length ?? 0} utenti.` }, { status: 400 });
      const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, message: "Password aggiornata" });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userData, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, message: "Password aggiornata" });
  }

  // ── Crea nuovo utente ──
  if (!email || !password || !nome) return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabaseAdmin.from("cg_utenti").insert({
    nome, email, ruolo: "admin", attivo: true,
    avatar_iniziali: nome.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    avatar_bg: "#2563eb", avatar_colore: "#ffffff",
    auth_user_id: data.user.id,
  });

  return NextResponse.json({ success: true });
}
