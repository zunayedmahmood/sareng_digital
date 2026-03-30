<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Refactor roles table:
 * - Drop the `level` column (replaced by frontend-driven role checks).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            // Drop the level index first, then the column
            if (Schema::hasColumn('roles', 'level')) {
                // Drop index if it exists (may fail silently on some DBs; that's okay)
                try {
                    $table->dropIndex(['level']);
                } catch (\Exception $e) {
                    // Index may not exist – ignore
                }
                $table->dropColumn('level');
            }
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->integer('level')->default(0)->after('guard_name')->comment('Role hierarchy level (deprecated, kept for rollback only)');
        });
    }
};
