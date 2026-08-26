# Device Guardian — Backend

Servidor Node.js/Express que:
- armazena os tokens FCM dos aparelhos registrados
- envia comandos remotos (`foto`, `audio`, `localizacao`) via Firebase Cloud Messaging
- recebe e lista as capturas salvas no Firebase Storage pelo app Android
- registra e devolve a última localização de cada aparelho

---

## Pré-requisitos

- Node.js 18+ instalado
- Um projeto criado no Firebase Console com:
  - Cloud Messaging ativado
  - Firebase Storage ativado
  - Conta de serviço gerada (chave JSON privada)

---

## Configuração passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o arquivo `.env`

```bash
cp .env.example .env
```

Edite o `.env` com seus valores reais:

```env
PORT=3000
OWNER_PASSWORD=sua-senha-forte-aqui
JWT_SECRET=string-aleatoria-longa-gerada-com-crypto
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
```

Para gerar o `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Para usar a senha com hash bcrypt (mais seguro):
```bash
node -e "console.log(require('bcryptjs').hashSync('sua-senha', 10))"
# cole o resultado no OWNER_PASSWORD do .env
```

### 3. Baixar a chave do Firebase

1. Acesse console.firebase.google.com → seu projeto
2. Configurações → Contas de serviço → Gerar nova chave privada
3. Salve o arquivo como `firebase-service-account.json` na raiz do backend

### 4. Iniciar o servidor

```bash
# Desenvolvimento (com reload automático)
npm run dev

# Produção
npm start
```

---

## Endpoints

### Autenticação

#### `POST /auth/login`
Obtém o token JWT para acessar os endpoints protegidos.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"senha": "sua-senha"}'
```
Resposta: `{ "token": "eyJ...", "expiresIn": "12h" }`

---

### Aparelhos

#### `GET /devices` 🔒
Lista todos os aparelhos registrados.

```bash
curl http://localhost:3000/devices \
  -H "Authorization: Bearer <token>"
```

#### `POST /devices/register`
Chamado automaticamente pelo app Android ao iniciar.

```bash
curl -X POST http://localhost:3000/devices/register \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "meu-moto-g", "token": "fcm-token-aqui", "label": "Moto G 5G"}'
```

#### `DELETE /devices/:deviceId` 🔒
Remove um aparelho da lista.

---

### Comandos Remotos

#### `POST /commands/send` 🔒
Envia um comando ao aparelho via FCM.

**Tirar foto:**
```bash
curl -X POST http://localhost:3000/commands/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "meu-moto-g", "comando": "foto"}'
```

**Gravar 15 segundos de áudio:**
```bash
curl -X POST http://localhost:3000/commands/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "meu-moto-g", "comando": "audio", "duracao": 15}'
```

**Pedir localização:**
```bash
curl -X POST http://localhost:3000/commands/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "meu-moto-g", "comando": "localizacao"}'
```

---

### Localização

#### `POST /location/update`
Chamado automaticamente pelo app Android quando o GPS atualiza.

#### `GET /location/:deviceId` 🔒
Retorna a última localização do aparelho.

```bash
curl http://localhost:3000/location/meu-moto-g \
  -H "Authorization: Bearer <token>"
```
Resposta: `{ "lat": -3.7, "lng": -38.5, "accuracy": 8, "timestamp": "2026-08-25T..." }`

---

### Capturas

#### `GET /captures` 🔒
Lista as fotos e áudios capturados (com URLs assinadas válidas por 1 hora).

```bash
curl "http://localhost:3000/captures?tipo=foto" \
  -H "Authorization: Bearer <token>"
```

#### `DELETE /captures/:nomeArquivo` 🔒
Deleta uma captura do Firebase Storage.

---

## Integrar com o app Android

No `MainActivity.kt` do app, adicione a chamada de registro:

```kotlin
private fun registerFcmToken() {
    FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
        // Substitua pela URL real do seu servidor
        val url = "https://seu-servidor.com/devices/register"
        val json = JSONObject().apply {
            put("deviceId", Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID))
            put("token", token)
            put("label", Build.MODEL)
        }
        // envie com OkHttp, Retrofit ou qualquer cliente HTTP
    }
}
```

No `GuardianForegroundService.kt`, envie a localização a cada atualização:

```kotlin
// dentro do LocationCallback.onLocationResult:
enviarLocalizacaoParaBackend(location.latitude, location.longitude, location.accuracy)
```

---

## Deploy em produção

Opções simples e gratuitas (ou baratas):
- **Railway** → conecta ao GitHub e sobe automaticamente, variáveis de ambiente pelo painel
- **Render** → similar ao Railway, free tier disponível
- **Fly.io** → Dockerfile opcional, CLI simples

Lembre-se de:
- usar HTTPS (todos os serviços acima fornecem)
- nunca subir o `firebase-service-account.json` ou `.env` para o GitHub
- configurar o `.gitignore` para excluí-los
