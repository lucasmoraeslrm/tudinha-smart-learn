# API Endpoints para N8N

## Endpoints Disponíveis

### 1. Autenticação
**Base URL:** `https://pwdkfekouyyujfwmgqls.supabase.co/auth/v1`

#### Login
- **POST** `/token`
- **Headers:** 
  - `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGtmZWtvdXl5dWpmd21ncWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mjc4OTQsImV4cCI6MjA2ODEwMzg5NH0.FQfRU7zv5Y2cj2CZT6KFdciekApZl8NxThZjfTNLzko`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "grant_type": "password"
}
```

### 2. Database API
**Base URL:** `https://pwdkfekouyyujfwmgqls.supabase.co/rest/v1`

#### Headers Obrigatórios
- `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGtmZWtvdXl5dWpmd21ncWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mjc4OTQsImV4cCI6MjA2ODEwMzg5NH0.FQfRU7zv5Y2cj2CZT6KFdciekApZl8NxThZjfTNLzko`
- `Authorization: Bearer TOKEN_DO_USUARIO` (obtido no login)
- `Content-Type: application/json`

#### Listar Alunos
- **GET** `/students`
- **Retorna:** Lista de todos os alunos

#### Criar Aluno
- **POST** `/students`
- **Body:**
```json
{
  "name": "Nome do Aluno",
  "email": "aluno@email.com",
  "age": 15
}
```

#### Listar Exercícios
- **GET** `/exercises`
- **Filtros possíveis:**
  - `?subject=eq.Matemática` - Filtrar por matéria
  - `?difficulty=eq.medium` - Filtrar por dificuldade

#### Criar Exercício
- **POST** `/exercises`
- **Body:**
```json
{
  "title": "Título do Exercício",
  "subject": "Matemática",
  "question": "Pergunta do exercício",
  "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
  "correct_answer": "Opção 1",
  "explanation": "Explicação da resposta",
  "difficulty": "medium"
}
```

#### Listar Listas de Exercícios
- **GET** `/exercise_lists`

#### Criar Lista de Exercícios
- **POST** `/exercise_lists`
- **Body:**
```json
{
  "title": "Nome da Lista",
  "subject": "Matemática",
  "description": "Descrição da lista",
  "difficulty": "medium",
  "exercise_ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### Listar Respostas dos Alunos
- **GET** `/student_answers`
- **Filtros possíveis:**
  - `?student_id=eq.UUID_DO_ALUNO` - Respostas de um aluno específico

#### Criar Resposta do Aluno
- **POST** `/student_answers`
- **Body:**
```json
{
  "student_id": "uuid-do-aluno",
  "exercise_id": "uuid-do-exercicio",
  "list_id": "uuid-da-lista",
  "user_answer": "Resposta do aluno",
  "is_correct": true
}
```

#### Chat Admin
- **GET** `/admin_chat_logs` - Listar histórico
- **POST** `/admin_chat_logs` - Criar novo log
- **Body:**
```json
{
  "student_id": "uuid-do-aluno",
  "admin_message": "Mensagem do admin",
  "ai_response": "Resposta da IA"
}
```

### 3. Mensagens (Chat)
#### Listar Mensagens
- **GET** `/messages`
- **Filtros:**
  - `?session_id=eq.SESSAO_ID` - Mensagens de uma sessão específica

#### Criar Mensagem
- **POST** `/messages`
- **Body:**
```json
{
  "session_id": "id-da-sessao",
  "user_id": "id-do-usuario",
  "message": "Texto da mensagem",
  "sender": "user" 
}
```

### 4. Perfis de Usuário
#### Listar Perfis
- **GET** `/profiles`

#### Atualizar Perfil
- **PATCH** `/profiles?user_id=eq.UUID_USUARIO`
- **Body:**
```json
{
  "full_name": "Nome Completo",
  "role": "student"
}
```

## Códigos de Status HTTP
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Autenticação para N8N
1. Primeiro, faça login na API para obter o token
2. Use o token nas próximas requisições no header `Authorization: Bearer TOKEN`
3. O token expira, então implemente renovação automática se necessário

## Exemplos de Uso no N8N
### Workflow para criar aluno:
1. **HTTP Request Node** para login
2. **Set Node** para extrair o token
3. **HTTP Request Node** para criar aluno usando o token

### Webhook para receber dados:
- Configure um webhook no N8N
- Use os endpoints POST para inserir dados no sistema
- Implemente validação e tratamento de erros