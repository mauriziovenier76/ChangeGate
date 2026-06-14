import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, nome, utente_id } = await req.json();

  if (!email || !nome || !utente_id) {
    return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let authUserId: string | null = null;

  // Prova a creare l'utente; se esiste già, recupera l'ID esistente
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { nome, utente_id },
  });

  if (createError) {
    if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
      // Utente già esistente — recupera l'ID tramite listUsers
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === email);
      if (!existing) {
        return NextResponse.json({ error: "Utente già registrato ma non trovato." }, { status: 400 });
      }
      authUserId = existing.id;
    } else {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }
  } else {
    authUserId = created.user.id;
  }

  // Manda email per impostare/resettare la password
  const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
  });

  if (resetError) {
    return NextResponse.json({ error: resetError.message }, { status: 400 });
  }

  // Collega auth_user_id a cg_utenti
  if (authUserId) {
    await supabaseAdmin.from("cg_utenti").update({ auth_user_id: authUserId }).eq("id", utente_id);
  }

  return NextResponse.json({ success: true });
}
