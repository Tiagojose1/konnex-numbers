const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_API_KEY_SID, 
  process.env.TWILIO_API_KEY_SECRET, 
  { accountSid: process.env.TWILIO_ACCOUNT_SID }
);

client.messages
  .create({
     body: 'Teste de conexao Konnex',
     from: process.env.TWILIO_PHONE_NUMBER, // O número mágico +15005550006
     to: '258866802949' // Coloque o SEU número real aqui (com DDD e código do país)
   })
  .then(message => console.log('Conexão bem-sucedida! SID da mensagem: ' + message.sid))
  .catch(err => console.error('Erro na conexão:', err.message));