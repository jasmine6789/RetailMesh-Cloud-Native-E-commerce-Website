export type CardDetails = {
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
};

export const EMPTY_CARD_DETAILS: CardDetails = {
  cardName: '',
  cardNumber: '',
  expiration: '',
  cvv: '',
};

export function validateCardDetails(card: CardDetails): string | null {
  if (!card.cardName.trim()) {
    return 'Cardholder name is required';
  }

  const digits = card.cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) {
    return 'Enter a valid card number (13–19 digits)';
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiration.trim())) {
    return 'Expiration must be MM/YY';
  }

  if (!/^\d{3,4}$/.test(card.cvv.trim())) {
    return 'CVV must be 3 or 4 digits';
  }

  return null;
}
