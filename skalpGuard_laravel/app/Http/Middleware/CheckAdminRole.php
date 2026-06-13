<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->hasRole('admin')) {
            return $next($request);
        }

        auth()->logout();
        return redirect('/adminPanel/login')->with('error', 'Access denied. Admin role required.');
    }
}
