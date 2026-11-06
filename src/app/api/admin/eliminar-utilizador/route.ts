// src/app/api/admin/eliminar-utilizador/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, motivo } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID do utilizador é obrigatório.' }, { status: 400 });
    }

    // 1. Procurar os dados do utilizador ANTES de o apagar
    const { data: profile, error: erroPerfil } = await supabaseAdmin
      .from('profiles')
      .select('telefone')
      .eq('id', userId)
      .single();

    const { data: authUser, error: erroAuth } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (erroAuth || !authUser.user) {
      throw new Error('Utilizador não encontrado.');
    }

    const email = authUser.user.email;
    const telefone = profile?.telefone || null;

    // 2. Guardar na Lista Negra (Blacklist)
    if (email || telefone) {
      const { error: erroBloqueio } = await supabaseAdmin
        .from('blocked_users')
        .insert({
          email: email,
          telefone: telefone,
          motivo: motivo || 'Conta eliminada pelo administrador'
        });
        
      // Se der erro por duplicação (unique constraint), ignoramos e continuamos
      if (erroBloqueio && erroBloqueio.code !== '23505') {
        console.warn("Aviso ao guardar na blacklist:", erroBloqueio);
      }
    }

    // 3. Apagar os dados associados (se não usares ON DELETE CASCADE)
    // Exemplo: Apagar pedidos e transações (descomenta se necessário)
    // await supabaseAdmin.from('orders').delete().eq('user_id', userId);
    // await supabaseAdmin.from('transactions').delete().eq('user_id', userId);
    
    // Apagar o perfil público
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 4. Apagar a conta de Autenticação (o login)
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Utilizador e dados eliminados, e dados guardados na blacklist.', data });
  } catch (error: any) {
    console.error('Erro ao eliminar utilizador:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}