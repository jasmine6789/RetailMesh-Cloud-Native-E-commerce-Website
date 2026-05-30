export interface Category {
  key: string;
  label: string;
  path: string;
}

export const NAVBAR_CATEGORIES: Category[] = [
  { key: 'laptops', label: '💻 Laptops', path: '/store?cat=laptops' },
  { key: 'smart-phones', label: '📱 Smart Phones', path: '/store?cat=smart-phones' },
  { key: 'head-phones', label: '🎧 Head Phones', path: '/store?cat=head-phones' },
  { key: 'desktops', label: '🖥️ Desktops', path: '/store?cat=desktops' },
  {
    key: 'tech-accessories',
    label: '⌨️ Tech Accessories',
    path: '/store?cat=tech-accessories',
  },
  { key: 'tablets', label: '📱 Tablets', path: '/store?cat=tablets' },
  { key: 'gaming', label: '🎮 Gaming', path: '/store?cat=gaming' },
  { key: 'wearables', label: '⌚ Wearables', path: '/store?cat=wearables' },
];

export const PROMO_MESSAGES = {
  freeShipping: '🎉 FREE SHIPPING on orders over $50',
  flashSale: '⚡ Flash Sale - Up to 50% OFF',
} as const;

export const CONTACT_INFO = {
  phone: '(123) 456-7890',
  phoneLink: 'tel:1234567890',
} as const;
