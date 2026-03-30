import { RoleSlug } from '@/types/roles';

/**
 * PAGE_ACCESS is the single source of truth for route-level authorization.
 * 
 * Rules:
 * - super-admin and admin have access to almost everything.
 * - branch-manager has access to branch-level administrative tools.
 * - online-moderator is focused on social-commerce and order management.
 * - pos-salesman is focused on branch POS and fulfillment.
 */
export const PAGE_ACCESS: Record<string, RoleSlug[]> = {
  '/dashboard': ['super-admin', 'admin', 'branch-manager', 'online-moderator', 'pos-salesman', 'employee'],
  '/social-commerce': ['super-admin', 'admin', 'branch-manager', 'online-moderator'],
  '/social-commerce/package': ['super-admin', 'admin', 'branch-manager', 'pos-salesman'],
  '/social-commerce/amount-details': ['super-admin', 'admin', 'branch-manager', 'online-moderator', 'pos-salesman'],
  '/inventory': ['super-admin', 'admin', 'branch-manager', 'online-moderator', 'pos-salesman'],
  '/inventory/reports': ['super-admin', 'admin', 'branch-manager'],
  '/orders': ['super-admin', 'admin', 'branch-manager', 'online-moderator'],
  '/purchase-orders': ['super-admin', 'admin', 'branch-manager', 'online-moderator'],
  '/pos': ['super-admin', 'admin', 'branch-manager', 'pos-salesman'],
  '/accounting': ['super-admin', 'admin', 'branch-manager'],
  '/employees': ['super-admin', 'admin', 'branch-manager'],
  '/settings': ['super-admin', 'admin'],
  '/returns': ['super-admin', 'admin', 'branch-manager', 'online-moderator', 'pos-salesman'],
  '/lookup': ['super-admin', 'admin', 'branch-manager', 'pos-salesman'],
};
