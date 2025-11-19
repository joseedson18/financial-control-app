# Guia Rápido de Uso - Business Plan Umatch Automatizado

**Versão:** 1.0  
**Data:** 19 de novembro de 2025

---

## 🚀 Início Rápido

### Passo 1: Abrir a Planilha

Abra o arquivo **Business_Plan_Umatch_Automatizado_FINAL.xlsx** no Microsoft Excel ou LibreOffice Calc.

### Passo 2: Conhecer as Abas

A planilha possui **8 abas** organizadas:

1. **P&L** - Demonstrativo principal com todas as receitas, custos e despesas
2. **DRE** - Demonstração do Resultado do Exercício (formato contábil)
3. **Dashboard** - KPIs e análises visuais
4. **Inputs** - Parâmetros editáveis
5. **Mapeamento** - Regras de referência cruzada
6. **Extrato_Importado** - Dados do Conta Azul
7. **Glossário** - Termos e siglas
8. **Checklist** - Guia de implantação

### Passo 3: Revisar o Dashboard

Vá até a aba **Dashboard** para visualizar os principais indicadores:
- Receita Total
- EBITDA
- Margem EBITDA
- Gross Margin
- NAU (usuários ativos)
- CPA (custo por aquisição)

---

## 📥 Importar Dados do Conta Azul

### 1. Exportar do Conta Azul

1. Acesse o **Conta Azul**
2. Vá em **Relatórios** → **Extrato Financeiro**
3. Selecione o período desejado
4. Clique em **Exportar** → **CSV**
5. Salve o arquivo no seu computador

### 2. Importar para a Planilha

1. Abra o arquivo CSV exportado
2. Copie todos os dados (Ctrl+A, Ctrl+C)
3. Vá até a aba **Extrato_Importado** na planilha
4. Selecione a célula **A4** (primeira linha de dados)
5. Cole os dados (Ctrl+V)
6. **Importante:** Verifique se a coluna **Data de competência** está no formato DD/MM/YYYY

### 3. Verificar Atualização Automática

1. Vá até a aba **P&L**
2. Verifique se os valores foram atualizados
3. Confira especialmente as linhas de **Receita** (linhas 29 e 37) e **COGS** (linhas 47-52)

---

## ✏️ Preencher Campos Editáveis

### Identificar Campos Editáveis

Campos editáveis estão destacados em **amarelo** nas abas:
- **Inputs** - Parâmetros gerais
- **P&L** - Valores não importados automaticamente

### Principais Campos Editáveis

**Na aba Inputs:**
- Taxa Apple/Google (padrão: 0,85)
- Custos COGS individuais (se não importados)
- Despesas SG&A (se não importadas)

**Na aba P&L:**
- NAU (Net Active Users) - linhas 5-14
- CPA (Cost Per Acquisition) - linhas 16-22
- Valores de receita/custo não mapeados

### Como Preencher

1. Localize a célula amarela
2. Clique nela
3. Digite o valor
4. Pressione **Enter**
5. As fórmulas dependentes serão atualizadas automaticamente

---

## 🔧 Adicionar Novos Fornecedores

### Quando Adicionar

Quando um novo fornecedor/cliente aparece no extrato do Conta Azul e não está mapeado.

### Como Adicionar

1. Vá até a aba **Mapeamento**
2. Localize a última linha preenchida
3. Adicione uma nova linha com:
   - **Grupo Financeiro:** COGS, SG&A, Receita Google, etc.
   - **Centro de Custo:** Nome exato do Conta Azul
   - **Fornecedor/Cliente:** Nome exato do fornecedor
   - **Linha P&L:** Número da linha no P&L onde deve ser lançado
   - **Tipo:** Receita, Custo ou Despesa
   - **Ativo:** Sim
   - **Observações:** Descrição opcional

### Exemplo

| Grupo Financeiro | Centro de Custo | Fornecedor/Cliente | Linha P&L | Tipo | Ativo | Observações |
|------------------|-----------------|-------------------|-----------|------|-------|-------------|
| COGS | Web Services Expenses | Vercel | 47 | Custo | Sim | Hospedagem frontend |

---

## 📊 Analisar Resultados

### Dashboard - Visão Geral

**Aba:** Dashboard

**O que ver:**
- KPIs principais do último mês
- Resumo mensal dos últimos 6 meses
- Análise de custos com percentuais sobre receita

**Como usar:**
- Compare valores mês a mês
- Identifique tendências (crescimento/queda)
- Verifique se margens estão dentro do esperado

### P&L - Detalhamento

**Aba:** P&L

**O que ver:**
- Receitas por plataforma (Google/Apple) e região (Brazil/USA)
- Custos diretos (COGS) detalhados por fornecedor
- Despesas operacionais (Marketing, Salários, Tech Support)
- Margens e percentuais calculados automaticamente

**Como usar:**
- Role horizontalmente para ver evolução mensal
- Compare meses específicos
- Identifique custos que estão crescendo acima do esperado

### DRE - Formato Contábil

**Aba:** DRE

**O que ver:**
- Receita Operacional Bruta
- Lucro Bruto
- EBITDA
- Resultado Operacional

**Como usar:**
- Use para apresentações formais
- Compare com demonstrativos oficiais
- Valide consistência com P&L

---

## ⚠️ Problemas Comuns

### Valores Não Aparecem no P&L

**Causa:** Fornecedor/cliente não está mapeado

**Solução:**
1. Vá até **Extrato_Importado**
2. Identifique o fornecedor/cliente
3. Vá até **Mapeamento**
4. Adicione o mapeamento (veja seção "Adicionar Novos Fornecedores")

### Data de Competência Errada

**Causa:** Formato de data não reconhecido

**Solução:**
1. Vá até **Extrato_Importado**
2. Selecione a coluna **Data de competência**
3. Formate como **DD/MM/YYYY**
4. Se necessário, use a função `=TEXT(A4,"DD/MM/YYYY")` para converter

### Fórmulas Retornam #REF!

**Causa:** Referência a célula/aba inexistente

**Solução:**
1. Clique na célula com erro
2. Verifique a fórmula na barra de fórmulas
3. Corrija a referência se necessário
4. Se o erro persistir, restaure de um backup

### Valores Duplicados

**Causa:** Dados do Conta Azul foram colados sobre dados existentes

**Solução:**
1. Vá até **Extrato_Importado**
2. Selecione todas as linhas de dados (a partir da linha 4)
3. Delete as linhas
4. Cole novamente os dados do CSV

---

## 💾 Backup e Versionamento

### Quando Fazer Backup

- **Antes** de importar novos dados
- **Antes** de fazer alterações significativas no mapeamento
- **Mensalmente** (mesmo sem alterações)

### Como Fazer Backup

1. Clique em **Arquivo** → **Salvar Como**
2. Renomeie o arquivo com a data: `Business_Plan_Umatch_2025-11-19.xlsx`
3. Salve em uma pasta de backups
4. Mantenha pelo menos **3 versões anteriores**

### Documentar Alterações

1. Vá até a aba **Inputs**
2. Localize o campo **Observações**
3. Registre:
   - Data da alteração
   - O que foi alterado
   - Motivo da alteração
   - Responsável

---

## 📖 Glossário Rápido

| Sigla | Significado | Onde Encontrar |
|-------|-------------|----------------|
| **NAU** | Net Active Users (usuários ativos) | P&L linha 5 |
| **CPA** | Cost Per Acquisition (custo por usuário) | P&L linha 16 |
| **COGS** | Cost of Goods Sold (custo direto) | P&L linha 46 |
| **SG&A** | Selling, General & Administrative | P&L linha 59 |
| **EBITDA** | Lucro antes de juros, impostos, depreciação | P&L linha 74 |
| **EBIT** | Lucro operacional | P&L linha 75 |
| **OpEx** | Operating Expenses (despesas operacionais) | P&L linha 57 |

Para mais termos, consulte a aba **Glossário**.

---

## 🆘 Suporte

### Checklist de Implantação

Consulte a aba **Checklist** para um guia passo a passo completo.

### Documentação Completa

Consulte o arquivo **DOCUMENTACAO_Business_Plan_Umatch.md** para informações técnicas detalhadas.

### Contato

Para suporte técnico ou dúvidas, entre em contato com o desenvolvedor.

---

**Desenvolvido por Manus AI**  
**19 de novembro de 2025**
