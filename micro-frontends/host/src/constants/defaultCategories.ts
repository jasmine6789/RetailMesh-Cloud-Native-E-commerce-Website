import type { Categories } from '../services/categories/types';

/**
 * Default categories shown when the catalog API is unavailable.
 */
export const DEFAULT_CATEGORIES: Categories = [
  {
    id: 'laptops',
    name: 'Laptops',
    nameVi: 'Laptop',
    icon: '💻',
    path: '/store?cat=laptops',
    imageUrl:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'smart-phones',
    name: 'Smart Phones',
    nameVi: 'Điện thoại thông minh',
    icon: '📱',
    path: '/store?cat=smart-phones',
    imageUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'head-phones',
    name: 'Head Phones',
    nameVi: 'Tai nghe',
    icon: '🎧',
    path: '/store?cat=head-phones',
    imageUrl:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'desktops',
    name: 'Desktops',
    nameVi: 'Máy tính để bàn',
    icon: '🖥️',
    path: '/store?cat=desktops',
    imageUrl:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tech-accessories',
    name: 'Tech Accessories',
    nameVi: 'Phụ kiện công nghệ',
    icon: '⌨️',
    path: '/store?cat=tech-accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tablets',
    name: 'Tablets',
    nameVi: 'Máy tính bảng',
    icon: '📱',
    path: '/store?cat=tablets',
    imageUrl:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    nameVi: 'Gaming',
    icon: '🎮',
    path: '/store?cat=gaming',
    imageUrl:
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'wearables',
    name: 'Wearables',
    nameVi: 'Thiết bị đeo',
    icon: '⌚',
    path: '/store?cat=wearables',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
];
