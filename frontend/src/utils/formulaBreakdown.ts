interface DashboardData {
    kpis: {
        total_revenue?: number;
        gross_profit?: number;
        ebitda?: number;
        net_result?: number;
        ebitda_margin?: number;
        gross_margin?: number;
        google_revenue?: number;
        apple_revenue?: number;
    };
    monthly_data?: Array<Record<string, string | number>>;
    cost_structure?: {
        payment_processing?: number;
        cogs?: number;
        marketing?: number;
        wages?: number;
        tech?: number;
        other?: number;
    };
}

interface BreakdownStep {
    label: string;
    value: number;
    symbol?: '+' | '-' | '*' | '/' | '=';
    isSubItem?: boolean;
}

interface FormulaBreakdown {
    title: string;
    value: number;
    breakdown: BreakdownStep[];
    matlabFormula: string;
}

export const getFormulaBreakdown = (
    type: string,
    data: DashboardData,
    language: 'pt' | 'en' = 'pt'
): FormulaBreakdown | null => {
    const t = {
        pt: {
            totalRevenue: 'Receita Total',
            googleRev: 'Receita Google',
            appleRev: 'Receita Apple',
            investIncome: 'Rendimentos de Aplicações',
            grossProfit: 'Lucro Bruto',
            revenue: 'Receita Total',
            costOfRevenue: 'Custos Diretos',
            paymentProcessing: 'Payment Processing (17,65%)',
            cogs: 'COGS (Web Services)',
            ebitda: 'EBITDA',
            opex: 'Despesas Operacionais',
            sga: 'SG&A',
            marketing: 'Marketing',
            wages: 'Salários',
            techSupport: 'Tech Support & Services',
            otherExpenses: 'Outras Despesas',
            netResult: 'Resultado Líquido',
            ebitdaMargin: 'Margem EBITDA',
            grossMargin: 'Margem Bruta',
            total: 'Total'
        },
        en: {
            totalRevenue: 'Total Revenue',
            googleRev: 'Google Revenue',
            appleRev: 'Apple Revenue',
            investIncome: 'Investment Income',
            grossProfit: 'Gross Profit',
            revenue: 'Total Revenue',
            costOfRevenue: 'Cost of Revenue',
            paymentProcessing: 'Payment Processing (17.65%)',
            cogs: 'COGS (Web Services)',
            ebitda: 'EBITDA',
            opex: 'Operating Expenses',
            sga: 'SG&A',
            marketing: 'Marketing',
            wages: 'Wages',
            techSupport: 'Tech Support & Services',
            otherExpenses: 'Other Expenses',
            netResult: 'Net Result',
            ebitdaMargin: 'EBITDA Margin',
            grossMargin: 'Gross Margin',
            total: 'Total'
        }
    };

    const labels = t[language];

    // Get cost structure data
    const costStructure = data.cost_structure || {};
    const kpis = data.kpis || {};

    // Calculate components
    const paymentProcessing = costStructure.payment_processing || 0;
    const cogs = costStructure.cogs || 0;
    const marketing = costStructure.marketing || 0;
    const wages = costStructure.wages || 0;
    const tech = costStructure.tech || 0;
    const other = costStructure.other || 0;

    // Derived values
    const totalRevenue = kpis.total_revenue || 0;
    const costOfRevenue = paymentProcessing + cogs;
    const grossProfit = kpis.gross_profit || totalRevenue - costOfRevenue;
    const sgaTotal = marketing + wages + tech;
    const totalOpex = sgaTotal + other;
    const ebitda = kpis.ebitda || grossProfit - totalOpex;
    const netResult = kpis.net_result || ebitda;

    // Revenue Breakdown (Actual values from backend)
    // If backend doesn't provide specific breakdown, fallback to estimation but prefer actuals
    const googleRev = kpis.google_revenue || (paymentProcessing / 0.1765) * 0.55;
    const appleRev = kpis.apple_revenue || (paymentProcessing / 0.1765) * 0.45;
    const investIncome = totalRevenue - (googleRev + appleRev);
    const revenueNoTax = googleRev + appleRev;

    switch (type) {
        case 'total_revenue':
            return {
                title: labels.totalRevenue,
                value: totalRevenue,
                breakdown: [
                    { label: labels.googleRev, value: googleRev, symbol: '+' },
                    { label: labels.appleRev, value: appleRev, symbol: '+' },
                    { label: labels.investIncome, value: investIncome, symbol: '=' },
                    { label: labels.total, value: totalRevenue, symbol: '=' }
                ],
                matlabFormula: `% ${labels.totalRevenue}\nTotal_Revenue = Google_Rev + Apple_Rev + Invest_Income\n\n% Valores:\nGoogle_Rev = ${googleRev.toFixed(2)}\nApple_Rev = ${appleRev.toFixed(2)}\nInvest_Income = ${investIncome.toFixed(2)}\nTotal_Revenue = ${totalRevenue.toFixed(2)}`
            };

        case 'gross_profit':
            return {
                title: labels.grossProfit,
                value: grossProfit,
                breakdown: [
                    { label: labels.revenue, value: totalRevenue, symbol: '-' },
                    { label: labels.costOfRevenue, value: costOfRevenue },
                    { label: labels.paymentProcessing, value: paymentProcessing, symbol: '-', isSubItem: true },
                    { label: labels.cogs, value: cogs, symbol: '-', isSubItem: true },
                    { label: labels.total, value: grossProfit, symbol: '=' }
                ],
                matlabFormula: `% ${labels.grossProfit}\nGross_Profit = Total_Revenue - Cost_of_Revenue\n\n% Onde:\nCost_of_Revenue = Payment_Processing + COGS\nPayment_Processing = Revenue_NoTax * 0.1765\n\n% Valores:\nTotal_Revenue = ${totalRevenue.toFixed(2)}\nPayment_Processing = ${paymentProcessing.toFixed(2)}\nCOGS = ${cogs.toFixed(2)}\nGross_Profit = ${grossProfit.toFixed(2)}`
            };

        case 'ebitda':
            return {
                title: labels.ebitda,
                value: ebitda,
                breakdown: [
                    { label: labels.grossProfit, value: grossProfit, symbol: '-' },
                    { label: labels.opex, value: totalOpex },
                    { label: labels.sga, value: sgaTotal, isSubItem: true },
                    { label: labels.marketing, value: marketing, symbol: '-', isSubItem: true },
                    { label: labels.wages, value: wages, symbol: '-', isSubItem: true },
                    { label: labels.techSupport, value: tech, symbol: '-', isSubItem: true },
                    { label: labels.otherExpenses, value: other, symbol: '-' },
                    { label: labels.total, value: ebitda, symbol: '=' }
                ],
                matlabFormula: `% ${labels.ebitda}\nEBITDA = Gross_Profit - OpEx\n\n% Onde:\nOpEx = SGA + Other_Expenses\nSGA = Marketing + Wages + Tech_Support\n\n% Valores:\nGross_Profit = ${grossProfit.toFixed(2)}\nMarketing = ${marketing.toFixed(2)}\nWages = ${wages.toFixed(2)}\nTech_Support = ${tech.toFixed(2)}\nOther_Expenses = ${other.toFixed(2)}\nEBITDA = ${ebitda.toFixed(2)}`
            };

        case 'net_result':
            return {
                title: labels.netResult,
                value: netResult,
                breakdown: [
                    { label: labels.ebitda, value: ebitda, symbol: '=' },
                    { label: labels.total, value: netResult, symbol: '=' }
                ],
                matlabFormula: `% ${labels.netResult}\n% Atualmente sem despesas financeiras ou impostos\nNet_Result = EBITDA\n\n% Fórmula completa (futura):\n% Net_Result = EBITDA - Financial_Expenses - Taxes\n\n% Valores:\nEBITDA = ${ebitda.toFixed(2)}\nNet_Result = ${netResult.toFixed(2)}`
            };

        case 'ebitda_margin': {
            const ebitdaMargin = kpis.ebitda_margin || (totalRevenue ? (ebitda / totalRevenue) * 100 : 0);
            return {
                title: labels.ebitdaMargin,
                value: ebitdaMargin,
                breakdown: [
                    { label: labels.ebitda, value: ebitda, symbol: '/' },
                    { label: labels.revenue, value: totalRevenue, symbol: '*' },
                    { label: '100', value: 100, symbol: '=' },
                    { label: labels.total + ' (%)', value: ebitdaMargin, symbol: '=' }
                ],
                matlabFormula: `% ${labels.ebitdaMargin}\nEBITDA_Margin = (EBITDA / Total_Revenue) * 100\n\n% Valores:\nEBITDA = ${ebitda.toFixed(2)}\nTotal_Revenue = ${totalRevenue.toFixed(2)}\nEBITDA_Margin = ${ebitdaMargin.toFixed(2)}%`
            };
        }

        case 'gross_margin': {
            const grossMargin = kpis.gross_margin || (totalRevenue ? (grossProfit / totalRevenue) * 100 : 0);
            return {
                title: labels.grossMargin,
                value: grossMargin,
                breakdown: [
                    { label: labels.grossProfit, value: grossProfit, symbol: '/' },
                    { label: labels.revenue, value: totalRevenue, symbol: '*' },
                    { label: '100', value: 100, symbol: '=' },
                    { label: labels.total + ' (%)', value: grossMargin, symbol: '=' }
                ],
                matlabFormula: `% ${labels.grossMargin}\nGross_Margin = (Gross_Profit / Total_Revenue) * 100\n\n% Valores:\nGross_Profit = ${grossProfit.toFixed(2)}\nTotal_Revenue = ${totalRevenue.toFixed(2)}\nGross_Margin = ${grossMargin.toFixed(2)}%`
            };
        }

        // Cost structure breakdowns
        case 'payment_processing':
            return {
                title: labels.paymentProcessing,
                value: paymentProcessing,
                breakdown: [
                    { label: 'Revenue (Google + Apple)', value: revenueNoTax, symbol: '*' },
                    { label: 'Taxa', value: 0.1765, symbol: '=' },
                    { label: labels.total, value: paymentProcessing, symbol: '=' }
                ],
                matlabFormula: `% ${labels.paymentProcessing}\nPayment_Processing = Revenue_NoTax * 0.1765\n\n% Valores:\nRevenue_NoTax = ${revenueNoTax.toFixed(2)}\nTaxa = 17.65%\nPayment_Processing = ${paymentProcessing.toFixed(2)}`
            };

        case 'cogs':
        case 'marketing':
        case 'wages':
        case 'tech':
        case 'other': {
            const valueMap: Record<string, number> = {
                cogs,
                marketing,
                wages,
                tech,
                other
            };
            const labelMap: Record<string, string> = {
                cogs: labels.cogs,
                marketing: labels.marketing,
                wages: labels.wages,
                tech: labels.techSupport,
                other: labels.otherExpenses
            };
            return {
                title: labelMap[type],
                value: valueMap[type],
                breakdown: [
                    {
                        label: labels.total,
                        value: valueMap[type],
                        symbol: '='
                    }
                ],
                matlabFormula: `% ${labelMap[type]}\nTotal = ${valueMap[type].toFixed(2)}`
            };
        }

        default:
            return null;
    }
};
