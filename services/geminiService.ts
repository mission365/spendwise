
import { GoogleGenAI } from "@google/genai";
import { Expense, Budget } from "../types";

export const getFinancialAdvice = async (expenses: Expense[], budget: Budget): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const summary = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const prompt = `
    Act as a professional financial advisor. 
    User's monthly budget: $${budget.limit}
    Total spent so far: $${totalSpent}
    
    Breakdown by category:
    ${JSON.stringify(summary, null, 2)}

    Provide a short, motivating 3-sentence analysis of their spending habits. 
    If they are over budget, suggest one specific area to cut back. 
    If they are doing well, encourage them.
    Keep it concise and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Your AI advisor is currently offline. Keep tracking those expenses!";
  }
};
