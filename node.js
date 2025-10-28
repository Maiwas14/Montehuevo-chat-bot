import whatsappWeb from "whatsapp-web.js";
const { Client, LocalAuth } = whatsappWeb;
import qrcode from "qrcode-terminal";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // Si instalaste 'puppeteer' no necesitas cambiar executablePath.
    // Si usas 'puppeteer-core' y quieres usar Chrome del sistema, descomenta y ajusta la ruta:
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  },
});

client.on("qr", qr => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("✅ Bot de Montehuevo listo en WhatsApp"));

client.on("message", async msg => {
  const text = msg.body.trim();
  console.log(`📩 Mensaje de ${msg.from}: ${text}`);

  if (msg.fromMe) return;
  if (msg.from === "status@broadcast" || msg.isStatus) return;
  if (msg.from.endsWith("@g.us")) return;

  const textoCliente = text.toLowerCase();

  // ==========================
  // 💳 DETECTOR DE PAGO / TRANSFERENCIA
  // ==========================
  const palabrasPago = [
    "pago",
    "transferencia",
    "transferir",
    "deposito",
    "depósito",
    "cuenta",
    "banco",
    "pagar",
    "scotiabank",
  ];

  if (palabrasPago.some(p => textoCliente.includes(p))) {
    const datosTransferencia = `
💳 *Datos para transferencia Montehuevo* 🥚

Nombre: *Miguel Ángel Espildora*  
RUT: *19.939.961-6*  
Banco: *Scotiabank*  
Tipo de cuenta: *Cuenta Corriente*  
Número de cuenta: *992825715*  
Correo: *meespildora14@gmail.com*  
💬 *Asunto:* Pedido Montehuevo  

Una vez hecha la transferencia, envíanos el comprobante por aquí 📸 para coordinar la entrega 🚚🐔
    `;
    await msg.reply(datosTransferencia);
    return;
  }

  // ==========================
  // 🧾 CONFIRMACIÓN DE PAGO RECIBIDO
  // ==========================
  const palabrasConfirmacion = [
    "ya pague",
    "ya pagué",
    "ya transferi",
    "ya transferí",
    "hice la transferencia",
    "hice el pago",
    "realicé la transferencia",
    "te transferí",
    "listo el pago",
    "pago hecho",
  ];

  if (palabrasConfirmacion.some(p => textoCliente.includes(p))) {
    const confirmacion = `
✅ ¡Gracias por tu pago, 🥚 cliente de *Montehuevo*!  
Verificaremos el comprobante y te confirmaremos la entrega a la brevedad 🧾🚚🐔  
`;
    await msg.reply(confirmacion);
    return;
  }

  // ==========================
  // ☎️ DETECTOR DE CONTACTO HUMANO
  // ==========================
  const palabrasContacto = [
    "hablar con alguien",
    "persona real",
    "humano",
    "contacto",
    "teléfono",
    "numero",
    "número",
    "vendedor",
    "asesor",
    "llamar",
  ];

  if (palabrasContacto.some(p => textoCliente.includes(p))) {
    const respuestaContacto = `
📞 *Contactos de Montehuevo* 🥚

📍 *Viña del Mar:*  
- +56 9 7798 4095  
- +56 9 8180 2006  

📍 *Santiago:*  
- +56 9 8341 7761  

Puedes escribir o llamar directamente a cualquiera de estos números para atención personalizada 🐔💬
    `;
    await msg.reply(respuestaContacto);
    return;
  }

  // ==========================
  // 🤖 CHATGPT (consultas normales)
  // ==========================
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Eres el vendedor virtual de Montehuevo, un emprendimiento que vende huevos premium en Viña del Mar y Santiago. 
Responde solo con información sobre los productos, precios, pedidos o zonas de entrega. 
No des información adicional ni hables sobre el clima u otros temas.

Productos:
- Huevos Extra blancos 🥚
- Huevos Extra color 🐔 (de gallina libre)
- Huevos Primera blancos 🥚

Precios:
- Extra blancos (30 unidades): $9.200 con entrega 🚚
- Extra color (30 unidades, gallina libre): $8.990 con entrega 🚚
- Primera blancos (30 unidades): $7.500 con entrega 🚚

Usa un tono cercano, breve, simpático y vendedor (no robótico). 
Incluye ocasionalmente emojis que refuercen el mensaje (🐔🥚🚚💬). 
Si te preguntan algo que no tenga relación con el negocio, responde cortésmente que solo puedes entregar información sobre los productos, precios o pedidos de Montehuevo.
`,
        },
        { role: "user", content: text },
      ],
    });

    const respuesta = completion.choices[0].message.content;
    msg.reply(respuesta);
  } catch (error) {
    console.error("❌ Error al consultar OpenAI:", error);
    msg.reply("😢 Estoy teniendo problemas para responder ahora mismo. Intentemos de nuevo en un momento.");
  }
});

client.initialize();