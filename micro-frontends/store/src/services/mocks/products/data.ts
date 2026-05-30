import { Brand, ProductResponse, ProductType } from '../../products/schemas';

const images = {
  laptop:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  phone:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  headphones:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  desktop:
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  keyboard:
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  tablet:
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
  gaming:
    'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80',
  wearable:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
} as const;

function createProduct(
  id: string,
  name: string,
  type: ProductType,
  brand: Brand,
  price: number,
  imageFile: string,
  description: string
): ProductResponse {
  return {
    id,
    name,
    description,
    summary: description.slice(0, 120),
    imageFile,
    brands: brand,
    types: type,
    price,
  };
}

export const mockTypes: ProductType[] = [
  { id: 'laptops', name: 'Laptops' },
  { id: 'smart-phones', name: 'Smart Phones' },
  { id: 'head-phones', name: 'Head Phones' },
  { id: 'desktops', name: 'Desktops' },
  { id: 'tech-accessories', name: 'Tech Accessories' },
  { id: 'tablets', name: 'Tablets' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'wearables', name: 'Wearables' },
];

export const mockBrands: Brand[] = [
  { id: 'retailmesh', name: 'RetailMesh' },
  { id: 'techgear', name: 'TechGear' },
  { id: 'progear', name: 'ProGear' },
];

const brand = mockBrands[0];
const techgear = mockBrands[1];
const progear = mockBrands[2];

export const mockProducts: ProductResponse[] = [
  createProduct(
    'lap-001',
    'RetailMesh ProBook 15',
    mockTypes[0],
    brand,
    1299.99,
    images.laptop,
    'Lightweight 15-inch laptop with 16GB RAM and 512GB SSD for everyday work and study.'
  ),
  createProduct(
    'lap-002',
    'RetailMesh Air 13',
    mockTypes[0],
    techgear,
    999.99,
    images.laptop,
    'Ultra-portable 13-inch laptop with all-day battery life and a crisp display.'
  ),
  createProduct(
    'phone-001',
    'RetailMesh Nova X',
    mockTypes[1],
    brand,
    899.99,
    images.phone,
    'Flagship smartphone with OLED display, triple camera, and 5G connectivity.'
  ),
  createProduct(
    'phone-002',
    'RetailMesh Lite 5G',
    mockTypes[1],
    techgear,
    499.99,
    images.phone,
    'Affordable 5G phone with a large battery and fast charging.'
  ),
  createProduct(
    'hp-001',
    'RetailMesh Studio ANC',
    mockTypes[2],
    brand,
    249.99,
    images.headphones,
    'Over-ear wireless headphones with active noise cancellation.'
  ),
  createProduct(
    'hp-002',
    'RetailMesh Buds Pro',
    mockTypes[2],
    techgear,
    129.99,
    images.headphones,
    'True wireless earbuds with transparency mode and wireless charging case.'
  ),
  createProduct(
    'desk-001',
    'RetailMesh Tower One',
    mockTypes[3],
    progear,
    1599.99,
    images.desktop,
    'Powerful desktop PC with dedicated graphics for creators and gamers.'
  ),
  createProduct(
    'desk-002',
    'RetailMesh All-in-One 27',
    mockTypes[3],
    brand,
    1199.99,
    images.desktop,
    '27-inch all-in-one desktop with built-in speakers and webcam.'
  ),
  createProduct(
    'acc-001',
    'RetailMesh USB-C Hub 7-in-1',
    mockTypes[4],
    techgear,
    59.99,
    images.keyboard,
    'Compact hub with HDMI, USB-A, USB-C, and SD card reader.'
  ),
  createProduct(
    'acc-002',
    'RetailMesh Mechanical Keyboard',
    mockTypes[4],
    progear,
    119.99,
    images.keyboard,
    'RGB mechanical keyboard with hot-swappable switches.'
  ),
  createProduct(
    'tab-001',
    'RetailMesh Pad 11',
    mockTypes[5],
    brand,
    449.99,
    images.tablet,
    '11-inch tablet with stylus support and detachable keyboard compatibility.'
  ),
  createProduct(
    'tab-002',
    'RetailMesh Pad Mini',
    mockTypes[5],
    techgear,
    299.99,
    images.tablet,
    'Compact 8-inch tablet for reading, streaming, and travel.'
  ),
  createProduct(
    'game-001',
    'RetailMesh GamePad Elite',
    mockTypes[6],
    progear,
    69.99,
    images.gaming,
    'Wireless controller with programmable buttons and low-latency connection.'
  ),
  createProduct(
    'game-002',
    'RetailMesh Racing Wheel Kit',
    mockTypes[6],
    brand,
    199.99,
    images.gaming,
    'Racing wheel and pedal set for PC and console simulation games.'
  ),
  createProduct(
    'wear-001',
    'RetailMesh Fit Band 2',
    mockTypes[7],
    techgear,
    79.99,
    images.wearable,
    'Fitness band with heart-rate tracking, sleep insights, and notifications.'
  ),
  createProduct(
    'wear-002',
    'RetailMesh Smart Watch S',
    mockTypes[7],
    brand,
    249.99,
    images.wearable,
    'Smartwatch with GPS, contactless pay, and customizable watch faces.'
  ),
];
