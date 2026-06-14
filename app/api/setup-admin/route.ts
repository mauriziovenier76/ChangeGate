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
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (!existing) return NextResponse.json({ error: "Utente non trovato in auth.users" }, { status: 400 });
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, message: "Password aggiornata" });
  }

  // ── Crea nuovo utente ──
  if (!email || !password || !nome) return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });

  let authUserId: string | null = null;
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (error) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === email);
    if (!existing) return NextResponse.json({ error: error.message }, { status: 400 });
    authUserId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
  } else {
    authUserId = data.user.id;
  }

  await supabaseAdmin.from("cg_utenti").insert({
    nome, email, ruolo: "admin", attivo: true,
    avatar_iniziali: nome.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    avatar_bg: "#2563eb", avatar_colore: "#ffffff",
    auth_user_id: authUserId,
  });

  return NextResponse.json({ success: true });
}
