<?php

use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\OrderManagementController;

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Helper to create a dummy order
function createDummyOrder($status = 'shipped') {
    $customer = Customer::first() ?: Customer::factory()->create();
    $order = Order::create([
        'order_number' => 'TEST-BULK-' . uniqid(),
        'customer_id' => $customer->id,
        'store_id' => 1,
        'status' => $status,
        'total_amount' => 100,
        'paid_amount' => 100,
        'order_type' => 'ecommerce',
    ]);

    $product = Product::first();
    if ($product) {
        OrderProduct::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 100,
            'total_amount' => 100,
        ]);
    }

    return $order;
}

echo "🚀 Starting Bulk Delivery Test...\n";

// Create 2 test orders
$order1 = createDummyOrder('shipped');
$order2 = createDummyOrder('processing'); // This one might fail depending on controller logic (usually needs to be shipped)
// Actually the controller check is: if ($order->status === 'delivered') return already delivered.
// It doesn't strictly check if it was shipped, though typically only shipped orders are delivered.

echo "📦 Created test orders: {$order1->order_number} (ID: {$order1->id}), {$order2->order_number} (ID: {$order2->id})\n";

$controller = new OrderManagementController();
$request = new Request();
$request->merge([
    'order_ids' => [$order1->id, $order2->id]
]);

try {
    $response = $controller->bulkMarkAsDelivered($request);
    $data = $response->getData(true);

    echo "✅ Response received:\n";
    echo "Success count: " . count($data['results']['success']) . "\n";
    echo "Failed count: " . count($data['results']['failed']) . "\n";

    foreach ($data['results']['success'] as $s) {
        echo "✔️ Order ID {$s['order_id']} marked as delivered.\n";
        
        // Verify in DB
        $o = Order::find($s['order_id']);
        if ($o->status === 'delivered') {
            echo "   Verification: DB Status is 'delivered' [OK]\n";
        } else {
            echo "   Verification: DB Status is '{$o->status}' [FAIL]\n";
        }
        
        if ($o->delivered_at) {
            echo "   Verification: delivered_at is set to {$o->delivered_at} [OK]\n";
        } else {
            echo "   Verification: delivered_at is NOT set [FAIL]\n";
        }
    }

    foreach ($data['results']['failed'] as $f) {
        echo "❌ Order ID {$f['order_id']} failed: {$f['error']}\n";
    }

} catch (\Exception $e) {
    echo "💥 Exception: " . $e->getMessage() . "\n";
}

echo "\n🧹 Cleaning up test data...\n";
$order1->delete();
$order2->delete();
echo "Done.\n";
