<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExpenseController extends Controller
{
    public function index()
    {
        return Expense::orderByDesc('date')
            ->orderByDesc('created_at')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => 'required|string|max:255',
            'amount'      => 'required|numeric',
            'category'    => 'required|string|max:100',
            'date'        => 'required|date',
        ]);

        $expense = Expense::create([
            'id'          => (string) Str::uuid(),
            ...$data,
        ]);

        return response()->json($expense, 201);
    }

    public function update(Request $request, string $id)
    {
        $expense = Expense::findOrFail($id);

        $data = $request->validate([
            'description' => 'required|string|max:255',
            'amount'      => 'required|numeric',
            'category'    => 'required|string|max:100',
            'date'        => 'required|date',
        ]);

        $expense->update($data);

        return response()->json($expense);
    }

    public function destroy(string $id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->noContent();
    }
}
