<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function show()
    {
        $budget = Budget::getInstance();
        return response()->json(['limit' => $budget->limit]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'limit' => 'required|numeric|min:0',
        ]);

        $budget = Budget::getInstance();
        $budget->update(['limit' => $data['limit']]);

        return response()->json(['limit' => $budget->limit]);
    }
}
