<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable(); // Para menús jerárquicos
            $table->string('icon', 255)->nullable(); // Icono del menú (Lucide icon name)
            $table->date('date_created')->useCurrent(); // Fecha de creación
            $table->string('link', 255)->nullable(); // Enlace/ruta del menú
            $table->text('description')->nullable(); // Descripción del menú
            $table->integer('order')->default(0); // Orden de aparición
            $table->boolean('is_free')->default(false); // Si es libre para todos
            $table->unsignedBigInteger('user_type_id')->nullable(); // Tipo de usuario (solo si is_free=true)
            $table->boolean('is_active')->default(true); // Si el menú está activo
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('parent_id')->references('id')->on('menus')->onDelete('cascade');
            $table->foreign('user_type_id')->references('id')->on('user_types')->onDelete('set null');
            
            // Indexes
            $table->index(['is_active', 'order']);
            $table->index(['parent_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
