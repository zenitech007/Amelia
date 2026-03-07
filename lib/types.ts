export const USER = 'user';
export const AMELIA = 'amelia';

export interface Message {
  role: typeof USER | typeof AMELIA;
  content: string;
  imageUrl?: string;
}

export interface Theme {
  name: string;
  primary: string;
  bg: string;
  text: string;
}