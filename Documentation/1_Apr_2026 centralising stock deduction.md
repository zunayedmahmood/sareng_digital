# Technical Documentation: Centralizing Stock Deduction
**Date:** 1 April 2026  
**Status:** Implemented  
**Objective:** Resolve duplicate inventory deduction in POS and Social Commerce workflows.

## 1. Problem Statement
Before this update, inventory was being deducted at multiple points in the order lifecycle:
1. **Order Creation:** For `counter` (POS) and assigned `social_commerce` orders.
2. **Barcode Scanning:** During the packaging phase in `StoreFulfillmentController`.
3. **Order Completion:** A fail-safe deduction in `OrderController@complete`.

This resulted in "duplicate selling," where an order of 2 items would often deduct 4 or more from the physical stock.

## 2. Architectural Solution: Reservation-First Model
The system has been refactored to use a **Reservation-First** model for all order types. Physical stock deduction is now deferred until the absolute final confirmation stage.

### Key Principles:
- **Instant Reservation:** Every order, including POS, now "holds" stock via the `ReservedProduct` model immediately upon creation. This prevents overselling without physically reducing batch quantities prematurely.
- **Single Point of Truth:** Physical stock deduction (`ProductBatch->removeStock()`) now only happens in `OrderController@complete`.
- **Atomic Release:** Reservations are released at the same moment the physical stock is deducted, ensuring that `available_stock` (Total - Reserved) remains consistent.

## 3. Detailed File Changes

### 3.1 `app/Observers/OrderItemObserver.php`
Enabled stock reservations for all channels.
- **Expanded Statuses:** Added `assigned_to_store`, `picking`, `processing`, and `ready_for_pickup` to the reservation whitelist.
- **Impact:** Every `OrderItem` now triggers an increment in `ReservedProduct->reserved_inventory` via `created`, `updated`, and `deleted` hooks, ensuring stock is held from creation until final confirmation.

### 3.2 `app/Http/Controllers/OrderController.php`
Two major changes in this controller:
- **`create` method:** Removed the block that immediately decremented `ProductBatch->quantity`. This was the primary source of early deduction in POS.
- **`complete` method:**
    - Set `$alreadyDeducted = false` for all order types.
    - Added logic to find the relevant `ReservedProduct` record and decrement `reserved_inventory` by the item quantity.
    - Recalculated `available_inventory` using the `(total_inventory - reserved_inventory)` formula to keep global availability accurate.

### 3.3 `app/Http/Controllers/StoreFulfillmentController.php`
Removed physical deduction from the fulfiller's workflow.
- **`scanBarcode` method:** Removed the `batch->decrement()` and the inline reservation release. Scanning now only validates and assigns the barcode/batch to the item.
- **`markReadyForShipment` method:** Removed the fail-safe FIFO deduction loop for unscanned items. Deduction is now safely handled by the centralized `complete` logic.

### 3.4 `app/Observers/OrderObserver.php`
Updated order-level status handling.
- **`updated` method:** Included `counter` orders in the status change listener. If a POS order is cancelled before completion, it now correctly releases its reservation.
- **`deleted` method:** Included `counter` orders in the hard-deletion cleanup to prevent "trapped" reservations.

## 4. Current Inventory Flow (Standardized)

1. **Phase 1: Order Initiation (Creation)**
   - Item is added to order.
   - `reserved_inventory` increases.
   - `available_stock` decreases (Global visibility).
   - *Physical Batch Quantity remains unchanged.*

2. **Phase 2: Fulfillment (Scanning/Packaging) - Optional**
   - Barcode is scanned.
   - Batch is linked to the `OrderItem`.
   - *No stock change happens here.*

3. **Phase 3: Order Finalization (Completion)**
   - `batch->removeStock()` reduces physical quantity.
   - `reserved_inventory` decreases.
   - `available_stock` is recalculated.
   - **Net Result:** Physical stock and Availability both accurately reflect the sale once.

## 5. Potential Edge Cases
- **Exchanges/Returns:** As these usually involve separate controllers or manual adjustments, they are currently outside the scope of this centralization and should be monitored for consistency with the reservation model.
- **Manual Adjustments:** Direct edits to `ProductBatch` quantities will still correctly trigger `total_inventory` syncs via the `ProductBatchObserver`, which in turn updates `available_stock` across the system.

## 6. Frontend: Selective Store-ID Injection
To support global warehouse assignment from store-scoped accounts:
- **`lib/axios.ts`:** Updated the request interceptor to only inject the user's `store_id` if it is **missing** from the request data. This allows the frontend to explicitly pass `store_id: null` for "Auto-assign at warehouse" without it being overridden by the local branch ID.

## 7. Summary of Benefits
- **Integrity:** Zero risk of duplicate deductions during standard scanning/completion flows.
- **Consistency:** `available_stock` is now calculated identically for both Online and Retail (POS) sales.
- **Flexibility:** Branch users can now correctly initiate warehouse-assigned orders.
- **Simplicity:** Developers only need to look at `OrderController@complete` to find the physical stock reduction logic.
