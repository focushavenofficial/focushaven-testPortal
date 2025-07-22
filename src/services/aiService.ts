export class AIService {
  private static readonly HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';
  private static readonly API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  static async checkSimilarity(text1: string, text2: string): Promise<number> {
    try {
      if (!this.API_KEY) {
        console.warn('Hugging Face API key not configured, using basic string comparison');
        return this.basicSimilarity(text1, text2);
      }

      const response = await fetch(this.HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: {
            source_sentence: text1.toLowerCase().trim(),
            sentences: [text2.toLowerCase().trim()]
          }
        })
      });

      if (!response.ok) {
        console.warn('Hugging Face API request failed, using fallback');
        throw new Error('Hugging Face API request failed');
      }

      const result = await response.json();
      
      // Handle different response formats
      if (Array.isArray(result) && result.length > 0) {
        return result[0];
      } else if (typeof result === 'number') {
        return result;
      } else {
        console.warn('Unexpected API response format, using fallback');
        return this.basicSimilarity(text1, text2);
      }
    } catch (error) {
      console.error('AI similarity check failed, using fallback:', error);
      return this.basicSimilarity(text1, text2);
    }
  }

  private static basicSimilarity(text1: string, text2: string): number {
    const str1 = text1.toLowerCase().trim();
    const str2 = text2.toLowerCase().trim();
    
    if (str1 === str2) return 1.0;
    
    // Check if one string contains the other
    if (str1.includes(str2) || str2.includes(str1)) {
      const shorter = str1.length < str2.length ? str1 : str2;
      const longer = str1.length >= str2.length ? str1 : str2;
      return shorter.length / longer.length;
    }
    
    // Simple word overlap similarity
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  static async isAnswerCorrect(userAnswer: string, expectedAnswer: string, threshold: number = 0.8): Promise<boolean> {
    // For exact matches or very similar answers
    if (userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim()) {
      return true;
    }
    
    // Use AI similarity checking
    const similarity = await this.checkSimilarity(userAnswer, expectedAnswer);
    return similarity >= threshold;
  }
}