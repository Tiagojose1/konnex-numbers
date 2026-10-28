import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express, { Request, Response } from 'express';
import twilio from 'twilio';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// ✅ CORS configurado para aceitar o teu site na Vercel e o localhost
app.use(cors({
  origin: ["http://localhost:3000", "https://konnex-numbers.vercel.app"]
}));
app.use(express.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID as string,
  process.env.TWILIO_AUTH_TOKEN as string
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// ==========================================
// ROTA 1 e 2: TWILIO (Registo de utilizadores)
// ==========================================
app.post('/send-verification', async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID as string)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
    return res.status(200).json({ status: verification.status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return res.status(500).json({ error: errorMessage });
  }
});

app.post('/verify-otp', async (req: Request, res: Response) => {
  const { phoneNumber, code, userId } = req.body;
  try {
    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID as string)
      .verificationChecks.create({ to: phoneNumber, code: code });

    if (check.status === 'approved') {
      await supabaseAdmin.from('perfis').update({ telefone: phoneNumber }).eq('id', userId);
    }
    return res.status(200).json({ status: check.status }); 
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return res.status(500).json({ error: errorMessage });
  }
});

// ==========================================
// ROTA 3: COMPRAR NÚMERO (SMSPool e 5sim)
// ==========================================
app.post('/api/buy-number', async (req: Request, res: Response) => {
  const { userId, service, country } = req.body; 
  const PRECO_COMPRA = 50;

  try {
    const { data: perfil, error: errPerfil } = await supabaseAdmin
      .from('profiles')
      .select('saldo')
      .eq('id', userId)
      .single();

    if (errPerfil || !perfil) throw new Error("Utilizador não encontrado.");
    
    const saldoAtual = parseFloat(perfil.saldo) || 0;
    if (saldoAtual < PRECO_COMPRA) {
      return res.status(400).json({ error: "Saldo insuficiente. Adicione saldo à sua conta." });
    }

    await supabaseAdmin.from('profiles').update({ saldo: saldoAtual - PRECO_COMPRA }).eq('id', userId);

    let numeroComprado = '';
    let idFornecedor = ''; 
    const fornecedorUsado = service === 'WhatsApp' ? '5sim' : 'smspool';

    try {
      if (fornecedorUsado === '5sim') {
        const pais5sim = 'russia'; 
        const fivesimRes = await fetch(`https://5sim.net/v1/user/buy/activation/${pais5sim}/any/whatsapp`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${process.env.FIVESIM_API_KEY}`,
            'Accept': 'application/json'
          }
        });

        const textData = await fivesimRes.text();
        let data5sim;
        try {
          data5sim = JSON.parse(textData);
        } catch {
          throw new Error(`Erro no 5sim: ${textData}`);
        }
        
        if (!fivesimRes.ok) throw new Error(data5sim.message || `Erro no 5sim: ${textData}`);

        numeroComprado = data5sim.phone;
        idFornecedor = data5sim.id.toString();

      } else {
        const smspoolRes = await fetch("https://api.smspool.net/purchase/sms", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            key: process.env.SMSPOOL_API_KEY as string,
            country: country || "MZ",
            service: service 
          })
        });

        const dataSpool = await smspoolRes.json();
        if (!smspoolRes.ok || dataSpool.success === 0) throw new Error(dataSpool.message || "Erro no SMSPool.");

        numeroComprado = dataSpool.number;
        idFornecedor = dataSpool.order_id;
      }

      const { data: novoPedido, error: dbError } = await supabaseAdmin
        .from('orders')
        .insert([{
          user_id: userId,
          numero: numeroComprado,
          servico: service,
          pais: country,
          status: 'Aguardando',
          sms_otp: 'Pendente',
          order_id_smspool: idFornecedor, 
          valor: PRECO_COMPRA,
          data_criacao: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) throw new Error("Erro ao guardar na Base de Dados.");

      return res.status(200).json({ 
        success: true, 
        numero: numeroComprado,
        pedidoId: novoPedido.id,
        orderId: idFornecedor,
        fornecedor: fornecedorUsado
      });

    } catch (errorCompra: unknown) {
      await supabaseAdmin.from('profiles').update({ saldo: saldoAtual }).eq('id', userId);
      throw errorCompra;
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro na compra:", errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
});

// ==========================================
// ROTA 4: VERIFICAR SMS (Polling Misto)
// ==========================================
app.get('/api/check-sms/:pedidoId/:orderId', async (req: Request, res: Response) => {
  const { pedidoId, orderId } = req.params;
  const { fornecedor } = req.query; 

  try {
    let codigoRecebido = null;

    if (fornecedor === '5sim') {
      const fivesimRes = await fetch(`https://5sim.net/v1/user/check/${orderId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${process.env.FIVESIM_API_KEY}`,
          'Accept': 'application/json'
        }
      });
      
      const textData = await fivesimRes.text();
      let data5sim;
      try { data5sim = JSON.parse(textData); } catch { return res.status(200).json({ sms_recebido: false }); }

      if (data5sim.sms && data5sim.sms.length > 0) {
        codigoRecebido = data5sim.sms[0].code;
      }

    } else {
      const smspoolRes = await fetch("https://api.smspool.net/sms/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          key: process.env.SMSPOOL_API_KEY as string,
          orderid: String(orderId) 
        })
      });
      const dataSpool = await smspoolRes.json();
      if (dataSpool.status === 3) {
        codigoRecebido = dataSpool.sms;
      }
    }

    if (codigoRecebido) {
      await supabaseAdmin
        .from('orders') 
        .update({ 
          status: 'Concluído', 
          sms_otp: 'Sucesso',
          codigo_recebido: codigoRecebido 
        })
        .eq('id', pedidoId);

      return res.status(200).json({ sms_recebido: true, codigo: codigoRecebido });
    }

    return res.status(200).json({ sms_recebido: false });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao verificar SMS:", errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});