# Business Plan Umatch - Sistema Automatizado de Controle Financeiro

## 📦 Conteúdo da Entrega

Este pacote contém a solução completa de automatização do controle financeiro do Business Plan Umatch, integrando dados do Conta Azul em regime de competência.

### Arquivos Incluídos

1. **Business_Plan_Umatch_Automatizado_FINAL.xlsx** (73 KB)
   - Planilha Excel principal com 8 abas
   - 666+ fórmulas automáticas
   - Importação automática do Conta Azul
   - Dashboard com KPIs visuais

2. **DOCUMENTACAO_Business_Plan_Umatch.md** (22 KB)
   - Documentação técnica completa
   - Descrição detalhada de todas as abas
   - Explicação de fórmulas e mapeamentos
   - Validação e testes realizados

3. **GUIA_RAPIDO_Uso.md** (7 KB)
   - Guia prático de uso diário
   - Passo a passo para importação de dados
   - Solução de problemas comuns
   - Glossário rápido

4. **README.md** (este arquivo)
   - Visão geral da entrega

## 🎯 Funcionalidades Principais

### ✅ Importação Automática
- Integração com extrato do Conta Azul (CSV)
- Mapeamento de 16 centros de custo
- 33 regras de referência cruzada
- Lançamento automático em linhas específicas do P&L

### ✅ Cálculos Automáticos
- Receita Bruta = Receita Líquida / 0,85
- Payment Processing = 17,65% da receita
- Margens por plataforma (Google/Apple) e região (Brazil/USA)
- COGS, Gross Profit, EBITDA, Operating Income

### ✅ Estrutura Completa
- **P&L:** Demonstrativo mensal com 18 meses (mai/2024 a out/2025)
- **DRE:** Formato contábil consolidado
- **Dashboard:** KPIs e análises visuais
- **Inputs:** Parâmetros editáveis
- **Mapeamento:** Regras de referência cruzada
- **Extrato_Importado:** Dados do Conta Azul (814 registros)
- **Glossário:** 19 termos e siglas
- **Checklist:** Guia de implantação

### ✅ Campos Editáveis
- Identificados em amarelo
- Permitem preenchimento manual quando dados não estão no Conta Azul
- Atualização automática de cálculos dependentes

## 🚀 Como Começar

### 1. Abrir a Planilha
Abra o arquivo **Business_Plan_Umatch_Automatizado_FINAL.xlsx** no Microsoft Excel ou LibreOffice Calc.

### 2. Revisar o Dashboard
Vá até a aba **Dashboard** para visualizar os KPIs principais.

### 3. Importar Dados
1. Exporte o extrato do Conta Azul em CSV
2. Cole os dados na aba **Extrato_Importado** (a partir da linha 4)
3. Verifique a atualização automática no P&L

### 4. Consultar Documentação
- **Uso diário:** Leia o **GUIA_RAPIDO_Uso.md**
- **Detalhes técnicos:** Consulte a **DOCUMENTACAO_Business_Plan_Umatch.md**

## 📊 Estrutura das Abas

| Aba | Descrição | Editável |
|-----|-----------|----------|
| P&L | Demonstrativo principal com receitas, custos e despesas | Campos amarelos |
| DRE | Demonstração do Resultado do Exercício | Não (referencia P&L) |
| Dashboard | KPIs e análises visuais | Não (referencia P&L) |
| Inputs | Parâmetros configuráveis | Sim (campos amarelos) |
| Mapeamento | Regras de referência cruzada | Sim (adicionar linhas) |
| Extrato_Importado | Dados do Conta Azul | Sim (colar CSV) |
| Glossário | Termos e siglas | Não (referência) |
| Checklist | Guia de implantação | Não (referência) |

## 🔧 Mapeamento de Centros de Custo

### Receitas
- Google Play Net Revenue → Receita Google
- App Store Net Revenue → Receita Apple
- Rendimentos de Aplicações → Invest Income

### COGS (Custos Diretos)
- Web Services Expenses → AWS, Cloudflare, Heroku, IAPHUB, MailGun, AWS SES

### SG&A (Despesas Operacionais)
- Marketing & Growth Expenses → Marketing
- Wages Expenses → Salários
- Tech Support & Services → Serviços de tecnologia

### Outras Despesas
- Legal & Accounting Expenses → Contabilidade/Jurídico
- Office Expenses → Escritório
- Travel → Viagens
- Other Taxes → Impostos

## 📈 KPIs Disponíveis

- **Receita Total:** Soma de todas as receitas
- **EBITDA:** Lucro antes de juros, impostos, depreciação e amortização
- **Margem EBITDA:** EBITDA / Receita
- **Gross Margin:** Lucro Bruto / Receita
- **NAU:** Net Active Users (usuários ativos)
- **CPA:** Cost Per Acquisition (custo por usuário)
- **Marketing / Revenue:** Percentual de marketing sobre receita

## ⚙️ Regras Técnicas

### ✅ Sintaxe A1 Exclusiva
Todas as fórmulas usam sintaxe A1 (ex: `A1`, `'P&L'!C24`, `$A$1`)

### ✅ Funções Não-Voláteis
- SUMIFS (importação condicional)
- IFERROR (tratamento de erros)
- SUM (totalizações)

### ✅ Controle de Erros
- Divisão por zero → retorna 0
- Valores ausentes → retorna 0
- Referências inválidas → retorna 0

### ✅ Precisão e Consistência
- Valores monetários: `R$ #,##0.00`
- Percentuais: `0.00%`
- Quantidades: `#,##0`

## 🎨 Código de Cores

| Cor | Significado |
|-----|-------------|
| 🟢 Verde | Receitas |
| 🟠 Laranja | Custos |
| 🟡 Amarelo | Campos editáveis |
| ⚪ Cinza | Fórmulas automáticas |
| 🔵 Azul | Cabeçalhos |

## 📝 Dados Importados

- **Período:** Dezembro/2024 a Dezembro/2025
- **Registros:** 814 movimentações
- **Centros de Custo:** 16 categorias
- **Fornecedores/Clientes:** 155 únicos

### Principais Movimentações
- Receitas: R$ 696.853,31 (Google + Apple)
- Despesas: R$ 205.695,51 (Marketing, Salários, Tech, Impostos)
- Rendimentos: R$ 7.677,42 (aplicações financeiras)

## ⚠️ Limitações

1. **Dependência do Conta Azul:** Estrutura do CSV deve ser mantida
2. **Mapeamento Manual:** Novos fornecedores precisam ser adicionados manualmente
3. **Dados Históricos:** Limitado a 18 meses (expansível)
4. **Gráficos:** Não incluídos (podem ser adicionados manualmente)
5. **Campos Não Importados:** NAU, CPA, ARPU devem ser preenchidos manualmente

## 🆘 Suporte

### Problemas Comuns
- **Valores não aparecem:** Verifique mapeamento na aba Mapeamento
- **Data errada:** Formate como DD/MM/YYYY
- **Fórmulas com erro:** Restaure de backup

### Documentação
- **Guia Rápido:** GUIA_RAPIDO_Uso.md
- **Documentação Completa:** DOCUMENTACAO_Business_Plan_Umatch.md
- **Checklist:** Aba Checklist na planilha

## 📦 Versão

**Versão:** 1.0  
**Data:** 19 de novembro de 2025  
**Desenvolvido por:** Manus AI

## 📄 Licença

Este material foi desenvolvido exclusivamente para Umatch Ltda.

---

**🎉 Planilha pronta para uso!**

Comece abrindo a planilha e explorando a aba Dashboard. Para importar novos dados, consulte o Guia Rápido.
