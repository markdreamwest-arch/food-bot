export interface UserSession {
  goal?: 'lose' | 'maintain' | 'gain';
  premium?: boolean;
}

export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  advice: string;
}
