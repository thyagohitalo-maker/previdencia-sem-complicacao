exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, nome, ebookUrl } = JSON.parse(event.body);

    const BREVO_KEY  = process.env.BREVO_KEY;
    const BREVO_FROM = process.env.BREVO_FROM;

    // 1. Salva contato na lista 5
    await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: nome || "" },
        listIds: [5],
        updateEnabled: true
      })
    });

    // 2. Envia e-mail com o ebook
    const emailHtml = `
<div style="background:#080F1C;padding:40px 20px;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#0D1829;border-radius:16px;overflow:hidden;border:1px solid #1C304A;">
    <div style="background:linear-gradient(90deg,#C9A84C,#7A5E1A);height:5px;"></div>
    <div style="padding:36px 32px;">
      <p style="color:#C9A84C;font-size:11px;font-weight:bold;letter-spacing:2px;margin:0 0 10px;">PREVIDÊNCIA SEM COMPLICAÇÃO</p>
      <h1 style="color:#EDD898;font-size:22px;margin:0 0 14px;line-height:1.35;">
        ${nome ? 'Olá, ' + nome + '!' : 'Olá!'} Seu ebook chegou 📘
      </h1>
      <p style="color:#6E8BA8;font-size:14px;line-height:1.75;margin:0 0 28px;">
        Clique no botão abaixo para baixar o guia
        <strong style="color:#C4D0DE;">Os 5 erros que servidores públicos cometem na previdência privada</strong>.
        São 8 páginas direto ao ponto.
      </p>
      <a href="${ebookUrl}"
         style="display:block;background:linear-gradient(135deg,#C9A84C,#7A5E1A);color:#080F1C;
                text-decoration:none;font-weight:bold;font-size:15px;padding:16px 28px;
                border-radius:10px;text-align:center;margin-bottom:28px;">
        📥 Baixar o ebook agora
      </a>
      <hr style="border:none;border-top:1px solid #1C304A;margin:24px 0;">
      <p style="color:#2A3F5C;font-size:11px;line-height:1.6;margin:0;">
        previdenciasemcomplicacao.com.br · Análise educacional, não constitui consultoria regulamentada.
      </p>
    </div>
  </div>
</div>`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_KEY },
      body: JSON.stringify({
        sender: { name: "Previdência Sem Complicação", email: BREVO_FROM },
        to: [{ email, name: nome || "Servidor" }],
        subject: "📘 Seu ebook chegou — Os 5 erros na previdência privada",
        htmlContent: emailHtml
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
