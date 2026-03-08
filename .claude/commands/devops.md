---
description: Invocar o agente DevOps para operações de infraestrutura, commit, push, build e deploy
model: haiku
---

# Comando: DevOps

Invoque o agente `devops` para executar a operação solicitada.

## Argumentos

`$ARGUMENTS` — operação desejada. Exemplos: `commit e push`, `checar build`, `gerar tipos`, `aplicar migrations`, `deploy`, `checar ambiente`.

## Workflow

### Step 1: Confirmar tarefa

Se `$ARGUMENTS` estiver vazio, use AskUserQuestion para perguntar o que o usuário quer fazer:

- Opção 1: "Commit e push" — commitar mudanças e enviar ao remoto
- Opção 2: "Checar build" — rodar `npm run build` e reportar erros
- Opção 3: "Checar ambiente" — validar variáveis de ambiente e estado do projeto
- Opção 4: "Aplicar migrations" — listar e aplicar migrations pendentes

### Step 2: Invocar agente devops

Use a ferramenta Task:

```
subagent_type: devops
description: <resumo da operação em 3-5 palavras>
prompt: <$ARGUMENTS ou resposta do usuário no Step 1>
```

### Step 3: Apresentar resultado

Exiba o resultado do agente ao usuário.
