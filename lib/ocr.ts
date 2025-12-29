import { createWorker } from 'tesseract.js';

// Smart categorizer logic for receipts
export interface ReceiptCategory {
  category: 'GP/Consultant' | 'Prescriptions' | 'Non-Routine Dental' | 'Nursing Home' | 'Dietary' | 'Guide Dog' | 'Other';
  confidence: number;
  amount: number;
  date: string | null;
  merchant: string;
}

const categoryKeywords: Record<string, string[]> = {
  'GP/Consultant': ['dr.', 'doctor', 'consultant', 'clinic', 'vhi', 'gp', 'physician', 'medical centre'],
  'Prescriptions': ['pharmacy', 'dispensing', 'drugs', 'prescription', 'chemist', 'medication'],
  'Non-Routine Dental': ['root canal', 'crown', 'periodontal', 'dental surgery', 'orthodontist', 'implant'],
  'Nursing Home': ['nursing home', 'convalescent', 'care home', 'residential care'],
  'Dietary': ['gluten free', 'diabetic', 'coeliac', 'special diet', 'dietary'],
  'Guide Dog': ['irish guide dogs', 'guide dog', 'assistance dog'],
};

export async function extractReceiptData(imageFile: File): Promise<ReceiptCategory> {
  const worker = await createWorker('eng');
  
  try {
    const { data } = await worker.recognize(imageFile);
    const text = data.text.toLowerCase();
    
    // Extract amount (look for € symbol followed by numbers)
    const amountMatch = text.match(/€?\s*(\d+[.,]\d{2})/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
    
    // Extract date (various formats)
    const dateMatch = text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    const date = dateMatch ? dateMatch[1] : null;
    
    // Extract merchant (usually first line or after common prefixes)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const merchant = lines[0] || 'Unknown';
    
    // Categorize based on keywords
    let bestCategory: ReceiptCategory['category'] = 'Other';
    let bestConfidence = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      const confidence = matches / keywords.length;
      
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestCategory = category as ReceiptCategory['category'];
      }
    }
    
    // Special check for non-routine dental
    if (bestCategory === 'Non-Routine Dental') {
      // Flag that Med 2 form is required
    }
    
    return {
      category: bestCategory,
      confidence: bestConfidence,
      amount,
      date,
      merchant: merchant.substring(0, 100), // Limit length
    };
  } finally {
    await worker.terminate();
  }
}

