# Reino Academy

Plataforma própria de aprendizagem e recursos para ministérios de mídia. React + TypeScript + Vite, Supabase Auth/Postgres/Storage e webhook Cakto. Visual responsivo em branco, preto e amarelo, com as capas e logo da marca.

## Executar

Requer Node 24. Copie `.env.example` para `.env`, execute `npm ci` e `npm run dev`. As duas variáveis `VITE_SUPABASE_*` são públicas. Nunca coloque uma chave `service_role` em variáveis `VITE_*`.

`npm test` valida normalização e autenticação dos eventos Cakto. `npm run build` verifica TypeScript e compila. `npx playwright install chromium && npm run test:e2e` testa login, onboarding, biblioteca, equipe, player e layouts desktop/mobile com fixtures sintéticas. O workflow GitHub executa esses comandos e guarda capturas. Os testes de autorização real ficam em `supabase/tests/access.sql`; a transação desfaz os registros de teste.

Plataforma: https://reino-academy.vercel.app/

## Entrega implantada

- Projeto Supabase: `iibxznwicmxrsogurith` (Reino Academy).
- 2 cursos, 21 módulos, 223 itens entre aulas e anexos, catalogados diretamente dos arquivos existentes no Drive.
- 16 materiais próprios, divididos em 25 arquivos DOCX/XLSX/PDF, no bucket privado `reino-materials`.
- Packs Canva Essencial (78 artes), biblioteca Canva (30 packs) e PSD. Links de entrega são consultados apenas por usuários com plano suficiente.
- Aulas usam o player do Drive e oferecem abertura no Drive. Não há vídeos copiados para o repositório.
- Pagamento único: Essencial R$27 / 1 acesso; Completo R$77 / 3 acessos; Avançado R$127 / 20 acessos. O responsável conta como um acesso. Convites pendentes reservam vagas por 7 dias.

O catálogo com IDs de aulas e URLs dos materiais foi importado diretamente no banco e não integra este repositório público. As migrações recriam a estrutura, não o conteúdo comercial.

## Primeiro acesso e administração

Cadastre-se usando o mesmo e-mail da compra e confirme o e-mail. O onboarding cria um ministério ou aceita um convite. A aprovação da compra é vinculada ao e-mail confirmado do responsável. Cada integrante tem seu próprio login e progresso.

O e-mail administrativo inicial é `kalebyalvesgamer@gmail.com`. Ele precisa criar e confirmar sua própria conta; nenhuma senha foi criada ou compartilhada. A autorização administrativa é conferida no servidor, por uma lista privada, e não por metadados editáveis do usuário.

Em Administração é possível editar materiais e planos mínimos, enviar arquivos protegidos, adicionar links e aulas, cadastrar ofertas Cakto, ver compras e configurar o e-mail de suporte. Convites são links para o responsável compartilhar manualmente.

## Configuração final antes das vendas

1. Em Supabase → Authentication → URL Configuration, defina **Site URL** como o endereço de produção. Adicione `https://reino-academy.vercel.app/**` aos redirect URLs (inclui recuperação e links de convite). Para testes locais, adicione `http://localhost:5173` e `http://localhost:5173/recuperar`.
2. Configure SMTP próprio e teste confirmação e recuperação de senha. O envio padrão do Supabase tem restrições e não deve ser usado como serviço de e-mail de produção.
3. Em Administração → Cakto, cadastre os três pares reais de **ID da oferta**, **ID do produto** e **URL do checkout**. Oferta e produto são validados juntos pelo servidor; nenhum ID fictício libera acesso.
4. Em Supabase → Edge Functions → Secrets, configure `CAKTO_WEBHOOK_SECRET` com o mesmo segredo fornecido pela configuração do webhook Cakto. Não cole esse segredo no frontend nem no GitHub.
5. Na Cakto, cadastre o endpoint abaixo para `purchase_approved`, `refund` e `chargeback`. A autenticação usa o campo `secret` do payload da Cakto. Sem o segredo no servidor, o endpoint responde 503 e não libera acesso.
6. Faça uma compra real de teste e confira: cadastro com o mesmo e-mail → confirmação → criação do ministério → acesso ao plano → convite → aula → download → reembolso revogando o conteúdo.
7. Confirme as permissões de visualização das aulas no Drive e a duplicação dos packs em uma conta pessoal Canva. Os arquivos CapCut existentes em formato `.ts` podem exigir conversão para MP4 se o Drive não oferecer preview; o link externo é um recurso de acesso, não uma garantia de reprodução incorporada.

Webhook: `https://iibxznwicmxrsogurith.supabase.co/functions/v1/cakto-webhook`

Configuração de frontend na Vercel: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do `.env.example`, nas três modalidades de ambiente. Framework Vite, build `npm run build`, saída `dist`, Node 24. `vercel.json` trata rotas SPA e headers básicos.

## Autorização e limites

O banco aplica RLS por ministério e plano. Documentos privados geram links assinados válidos por 5 minutos. URLs do Drive/Canva são protegidas no catálogo, mas continuam sendo links externos copiáveis depois de entregues; a plataforma não adiciona DRM a esses serviços.

Eventos repetidos são idempotentes. Reembolso e chargeback permanecem finais mesmo quando uma aprovação antiga chega depois. O maior plano de compras válidas define o acesso atual. A redução de plano bloqueia conteúdo e novos convites; integrantes já cadastrados não são removidos automaticamente, para evitar perda silenciosa de vínculos.

Pedidos armazenam somente ID, e-mail, oferta, plano, status e vínculo do ministério. CPF, telefone, cartão e segredo do webhook são descartados. Os esquemas privados não possuem acesso direto para usuários.

Não há assinaturas, integrações de mensagens automáticas, senhas universais ou liberação fictícia de compras. A operação comercial na Cakto e os contratos de revenda continuam sendo geridos pelo produtor.

Plataforma de cursos e recursos para mídia de igrejas. Implementação em andamento.
