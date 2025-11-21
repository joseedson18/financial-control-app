# Manual do Usuário - Dashboard Financeiro

Bem-vindo ao seu novo Dashboard Financeiro Automatizado! Este sistema roda na nuvem (Render), permitindo que você gerencie seus dados financeiros de qualquer lugar, sem necessidade de instalação.

## 🚀 Como Acessar

### 🌍 Acesso Online (Recomendado)
O sistema está disponível online. Basta acessar o link fornecido pelo administrador no seu navegador (Chrome, Firefox, Edge, etc.).

**Link de Acesso:** *[Insira o Link da Sua Aplicação no Render Aqui]*

### 💻 Rodando Localmente (Para Desenvolvedores)
Caso precise rodar o sistema no seu próprio computador para manutenção:
1. **Backend**: `cd backend && python main.py`
2. **Frontend**: `cd frontend && npm run dev`
3. Acesse no navegador: `http://localhost:5173`

---

## 1. Importação de Dados (Upload)

A primeira tela que você verá é a de **Importar Dados**.

1. Clique na área pontilhada ou arraste seu arquivo CSV exportado do Conta Azul.
2. Clique no botão **"Processar Arquivo"**.
3. O sistema processará os dados e atualizará automaticamente o Dashboard.
   * **Nota**: Seus dados são salvos automaticamente na nuvem, então você não precisa fazer upload toda vez que abrir o sistema.

## 2. Dashboard (Visão Geral)

A aba **Dashboard** oferece uma visão rápida da saúde financeira da sua empresa.

* **KPIs (Indicadores Chave)**:
  * **Receita Total**: Soma de todas as entradas operacionais.
  * **Resultado Líquido**: Lucro ou prejuízo final.
  * **Margem Bruta**: Porcentagem de lucro após custos diretos.
  * **EBITDA**: Lucro antes de juros, impostos, depreciação e amortização.
* **Gráficos**:
  * **Receita vs Custos**: Comparativo mensal.
  * **Estrutura de Custos**: Gráfico de pizza mostrando onde você gasta mais.
  * **Tendência de Lucro**: Linha do tempo do seu resultado líquido.
* **Exportar PDF**: Clique no botão "Exportar PDF" no canto superior direito para gerar um relatório impresso da tela atual.

## 3. DRE Gerencial (P&L)

A aba **DRE Gerencial** exibe seu Demonstrativo de Resultados do Exercício detalhado mês a mês.

### Funcionalidades Especiais:

* **Modo de Edição (Free Edition)**:
  1. Clique no botão **"Modo de Edição"** (ícone de lápis).
  2. A tabela ficará interativa. Clique em qualquer valor numérico para editá-lo.
  3. Digite o novo valor e pressione `Enter` ou clique fora.
  4. **Salvar**: Suas alterações são salvas automaticamente no sistema e persistirão mesmo se você fechar o navegador.
  5. Clique em **"Visualizar"** para sair do modo de edição.

* **Exportar CSV**: Baixe a tabela atual em formato Excel/CSV para análises externas.

## 4. Mapeamentos (Categorização)

A aba **Mapeamentos** permite que você ensine o sistema como categorizar suas despesas.

* **Como funciona**: O sistema tenta adivinhar a categoria com base na descrição do Conta Azul. Se errar, você pode corrigir aqui.
* **Adicionar Mapeamento**:
  1. Digite o termo que aparece na descrição (ex: "Uber").
  2. Selecione a categoria correta (ex: "Despesas de Viagem").
  3. Clique no botão **"+"**.
* **Gerenciar**: Você pode ver e excluir mapeamentos existentes na lista abaixo.

## 5. Configurações Gerais

* **Idioma**: No canto superior direito, você pode alternar entre **Português (PT)** e **Inglês (EN)** a qualquer momento.
* **Status do Sistema**: Na barra lateral, o indicador "Online" mostra se o backend está funcionando corretamente.

---

## ❓ Resolução de Problemas

**"Não há dados disponíveis"**
* Certifique-se de que você fez o upload do arquivo CSV.
* Verifique se o arquivo CSV do Conta Azul contém dados para o período selecionado.

**O sistema não salva minhas edições**
* Verifique se o indicador "Online" está verde. O sistema precisa do backend para salvar as alterações.

**Erro no Upload**
* Certifique-se de que o arquivo é um CSV válido exportado do Conta Azul.
* Se o erro persistir, verifique o console do backend para mais detalhes.
