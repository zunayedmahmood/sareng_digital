'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AccessDenied from '@/components/AccessDenied';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { productService, Product } from '@/services/productService';
import productImageService, { ProductImage } from '@/services/productImageService';
import { toAbsoluteAssetUrl } from '@/lib/urlUtils';
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Save, Search } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 20;

function imageUrlFor(image: Partial<ProductImage> | null | undefined): string {
  const raw = image?.image_url || image?.image_path || '';
  if (!raw) return '/placeholder-image.jpg';
  if (raw.startsWith('/storage/')) return toAbsoluteAssetUrl(raw);
  if (/^(https?:)?\/\//i.test(raw)) return raw;
  return toAbsoluteAssetUrl(`/storage/product-images/${raw}`);
}

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images]
    .filter((img) => img?.is_active !== false)
    .sort((a, b) => {
      if (!!a.is_primary !== !!b.is_primary) return a.is_primary ? -1 : 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
}

type ProductRow = {
  product: Product;
  images: ProductImage[];
  selectedImageId: number | null;
  originalPrimaryId: number | null;
  loadingImages: boolean;
  saving: boolean;
};

export default function PrimaryImageFixPage() {
  const { hasAnyPermission, permissionsResolved } = useAuth();
  const canAccess = hasAnyPermission(['products.view', 'products.edit', 'products.manage_images']);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentPage(1);
      setSearchTerm(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({
        page: currentPage,
        per_page: PAGE_SIZE,
        search: searchTerm || undefined,
        sort_by: 'updated_at',
        sort_direction: 'desc',
      });

      const baseRows: ProductRow[] = (response.data || []).map((product) => {
        const merged = sortImages((product.display_images as ProductImage[]) || (product.images as ProductImage[]) || []);
        const currentPrimary = merged.find((img) => img.is_primary) || merged[0] || null;
        return {
          product,
          images: merged,
          selectedImageId: currentPrimary?.id ?? null,
          originalPrimaryId: currentPrimary?.id ?? null,
          loadingImages: merged.length === 0,
          saving: false,
        };
      });

      setRows(baseRows);
      setTotalProducts(response.total || 0);
      setLastPage(response.last_page || 1);

      await Promise.all(
        baseRows.map(async (row) => {
          try {
            const fetchedImages = sortImages(await productImageService.getProductImages(row.product.id));
            const currentPrimary = fetchedImages.find((img) => img.is_primary) || fetchedImages[0] || null;
            setRows((prev) =>
              prev.map((item) =>
                item.product.id === row.product.id
                  ? {
                      ...item,
                      images: fetchedImages,
                      selectedImageId: currentPrimary?.id ?? null,
                      originalPrimaryId: currentPrimary?.id ?? null,
                      loadingImages: false,
                    }
                  : item
              )
            );
          } catch {
            setRows((prev) =>
              prev.map((item) =>
                item.product.id === row.product.id
                  ? {
                      ...item,
                      loadingImages: false,
                    }
                  : item
              )
            );
          }
        })
      );
    } catch (error) {
      console.error('Failed to load products for primary image fix:', error);
      setRows([]);
      setToast({ message: 'Failed to load products.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (!permissionsResolved || !canAccess) return;
    loadProducts();
  }, [canAccess, permissionsResolved, loadProducts, refreshTick]);

  const dirtyCount = useMemo(
    () => rows.filter((row) => row.selectedImageId && row.selectedImageId !== row.originalPrimaryId).length,
    [rows]
  );

  const handlePick = (productId: number, imageId: number) => {
    setRows((prev) => prev.map((row) => (row.product.id === productId ? { ...row, selectedImageId: imageId } : row)));
  };

  const refreshOne = async (productId: number) => {
    setRows((prev) => prev.map((row) => (row.product.id === productId ? { ...row, loadingImages: true } : row)));
    try {
      const fetchedImages = sortImages(await productImageService.getProductImages(productId));
      const currentPrimary = fetchedImages.find((img) => img.is_primary) || fetchedImages[0] || null;
      setRows((prev) =>
        prev.map((row) =>
          row.product.id === productId
            ? {
                ...row,
                images: fetchedImages,
                selectedImageId: currentPrimary?.id ?? null,
                originalPrimaryId: currentPrimary?.id ?? null,
                loadingImages: false,
                saving: false,
              }
            : row
        )
      );
    } catch (error) {
      console.error('Failed to refresh product images:', error);
      setRows((prev) => prev.map((row) => (row.product.id === productId ? { ...row, loadingImages: false, saving: false } : row)));
      setToast({ message: 'Could not refresh product images.', type: 'error' });
    }
  };

  const saveOne = async (productId: number) => {
    const row = rows.find((item) => item.product.id === productId);
    if (!row?.selectedImageId || row.selectedImageId === row.originalPrimaryId) return;

    setRows((prev) => prev.map((item) => (item.product.id === productId ? { ...item, saving: true } : item)));
    try {
      await productImageService.makePrimary(row.selectedImageId);
      await refreshOne(productId);
      setToast({ message: `${row.product.name}: primary image updated.`, type: 'success' });
    } catch (error: any) {
      console.error('Failed to save primary image:', error);
      setRows((prev) => prev.map((item) => (item.product.id === productId ? { ...item, saving: false } : item)));
      setToast({ message: error?.message || 'Failed to save primary image.', type: 'error' });
    }
  };

  const saveAllChanged = async () => {
    const changedRows = rows.filter((row) => row.selectedImageId && row.selectedImageId !== row.originalPrimaryId);
    if (!changedRows.length) return;

    for (const row of changedRows) {
      await saveOne(row.product.id);
    }
  };

  if (permissionsResolved && !canAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="mx-auto max-w-[1800px] p-4 md:p-6 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href="/product"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Primary Image Fixer</h1>
              <p className="mt-1 text-sm text-gray-600">
                Hidden utility page for fixing wrongly selected primary product images.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Open directly by URL only. Suggested route: <span className="font-mono">/product/primary-image-fix</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by product name or SKU"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <button
                onClick={() => setRefreshTick((v) => v + 1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={saveAllChanged}
                disabled={dirtyCount === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save changed ({dirtyCount})
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 px-1">
          <div>
            Showing page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-900">{Math.max(lastPage, 1)}</span>
          </div>
          <div>
            Total products: <span className="font-semibold text-gray-900">{totalProducts}</span>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 flex items-center justify-center gap-3 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading products…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            No products found for this search.
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const isDirty = !!row.selectedImageId && row.selectedImageId !== row.originalPrimaryId;

              return (
                <section
                  key={row.product.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="px-4 md:px-5 py-4 border-b border-gray-100 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-base md:text-lg font-semibold text-gray-900">{row.product.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>SKU: {row.product.sku || '—'}</span>
                        <span>ID: {row.product.id}</span>
                        {row.originalPrimaryId ? <span>Current primary image ID: {row.originalPrimaryId}</span> : <span>No primary image set</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDirty ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-medium">
                          Changed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                      )}

                      <button
                        onClick={() => saveOne(row.product.id)}
                        disabled={!isDirty || row.saving || row.loadingImages}
                        className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {row.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    {row.loadingImages ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading images…
                      </div>
                    ) : row.images.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                        No active images found for this product.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                        {row.images.map((image) => {
                          const selected = row.selectedImageId === image.id;
                          const currentPrimary = row.originalPrimaryId === image.id;

                          return (
                            <label
                              key={image.id}
                              className={`group cursor-pointer rounded-2xl border p-3 transition ${
                                selected
                                  ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/70'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`primary-image-${row.product.id}`}
                                checked={selected}
                                onChange={() => handlePick(row.product.id, image.id)}
                                className="sr-only"
                              />

                              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                <img
                                  src={imageUrlFor(image)}
                                  alt={row.product.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/placeholder-image.jpg';
                                  }}
                                />
                              </div>

                              <div className="mt-3 space-y-1.5">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="font-medium text-gray-700">Image #{image.id}</span>
                                  {currentPrimary && (
                                    <span className="rounded-full bg-gray-900 text-white px-2 py-0.5 text-[10px] font-semibold">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                  Sort: {image.sort_order ?? 0}
                                </div>
                                <div className={`text-xs font-medium ${selected ? 'text-blue-700' : 'text-gray-500'}`}>
                                  {selected ? 'Selected as primary' : 'Click to choose'}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous page
          </button>

          <div className="text-sm text-gray-600 text-center">
            Page <span className="font-semibold text-gray-900">{currentPage}</span> /{' '}
            <span className="font-semibold text-gray-900">{Math.max(lastPage, 1)}</span>
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(Math.max(lastPage, 1), p + 1))}
            disabled={currentPage >= lastPage || loading}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next page
          </button>
        </div>
      </main>
    </div>
  );
}
