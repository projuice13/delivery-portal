export interface PhoneNumber {
  canonical: string;
  display: string;
}

export interface InstructionWithSource {
  text: string;
  source: 'import' | 'library';
  label: string;
}

export interface DeliveryEntry {
  companyName: string;
  what3words: string[];
  phone: PhoneNumber[];
  instructions: InstructionWithSource[];
  image1Url?: string;
  image2Url?: string;
}

export interface DeliveryData {
  postcode: string;
  entries: DeliveryEntry[];
}

export interface DeliveryResult {
  postcode: string;
  data: DeliveryData | null;
}
