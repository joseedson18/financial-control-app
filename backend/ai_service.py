import os
from openai import OpenAI
import json

def generate_insights(data: dict, api_key: str) -> str:
    """
    Generates financial insights using OpenAI's GPT model.
    """
    if not api_key:
        return "Error: API Key is missing."

    try:
        client = OpenAI(api_key=api_key)

        # Prepare a summary of the data for the prompt
        kpis = data.get("kpis", {})
        monthly_data = data.get("monthly_data", [])
        
        # Simplify monthly data for the prompt to save tokens
        monthly_summary = []
        for item in monthly_data:
            monthly_summary.append(f"{item.get('month')}: Rev={item.get('revenue')}, Cost={item.get('costs')}, Profit={item.get('net_result')}")
        
        prompt = f"""
        You are an expert financial analyst. Analyze the following financial data for a company and provide sincere, actionable insights and recommendations.
        
        KPIs:
        - Total Revenue: {kpis.get('total_revenue')}
        - Net Result: {kpis.get('net_result')}
        - Gross Margin: {kpis.get('gross_margin')}
        - EBITDA: {kpis.get('ebitda')}
        
        Monthly Trends (Revenue, Costs, Net Result):
        {json.dumps(monthly_summary, indent=2)}
        
        Please provide:
        1. A sincere opinion on the current financial situation.
        2. 3-5 specific recommendations to improve profitability or reduce costs.
        3. Highlight any worrying trends.
        
        Format the output in Markdown. Be professional but direct.
        """

        response = client.chat.completions.create(
            model="gpt-4o", # Using a high-quality model (user mentioned GPT-5, but 4o is current standard/placeholder)
            messages=[
                {"role": "system", "content": "You are a helpful and critical financial assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error generating insights: {str(e)}"
