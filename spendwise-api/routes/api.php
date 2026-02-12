<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\BudgetController;

Route::get('/expenses', [ExpenseController::class, 'index']);
Route::post('/expenses', [ExpenseController::class, 'store']);
Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

Route::get('/budget', [BudgetController::class, 'show']);
Route::put('/budget', [BudgetController::class, 'update']);