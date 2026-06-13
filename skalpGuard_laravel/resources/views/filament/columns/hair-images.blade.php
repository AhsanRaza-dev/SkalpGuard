<?php
/**
 * Expects $record to be available. Renders three small thumbnails and an AlpineJS modal
 * to view the three images larger when any thumbnail is clicked.
 */
use Illuminate\Support\Facades\Storage;

// Helper: if public/storage exists, use asset('storage/...'), otherwise use proxy route
$urlFor = function ($path) {
    if (! $path) {
        return null;
    }

    $publicPath = public_path('storage/' . $path);
    if (file_exists($publicPath)) {
        return asset('storage/' . $path);
    }

    // fallback to proxy route which serves storage/app/public
    return route('storage.proxy', ['path' => $path]);
};

$img1 = $urlFor($record->image_1 ?? null);
$img2 = $urlFor($record->image_2 ?? null);
$img3 = $urlFor($record->image_3 ?? null);
?>

<div x-data="{ open: false }" x-cloak class="relative">
    <div class="flex items-center space-x-2">
        @php
            $thumb = $img1 ?? $img2 ?? $img3;
        @endphp

        @if($thumb)
            <img src="{{ $thumb }}" alt="scan-thumb-{{ $record->id }}" class="w-10 h-10 object-cover rounded" />
        @else
            <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">No
                Image</div>
        @endif

        <button type="button" @click.prevent="open = true" class="text-sm text-primary-600 hover:underline">View</button>
    </div>

    <template x-if="open">
        <div x-show="open" x-transition class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div @click.stop class="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full">
                <div class="flex justify-end">
                    <button @click="open = false" class="text-gray-600 hover:text-gray-900">Close</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    @if($img1)
                        <img src="{{ $img1 }}" alt="img1" class="w-full h-64 object-contain" />
                    @endif
                    @if($img2)
                        <img src="{{ $img2 }}" alt="img2" class="w-full h-64 object-contain" />
                    @endif
                    @if($img3)
                        <img src="{{ $img3 }}" alt="img3" class="w-full h-64 object-contain" />
                    @endif
                </div>
            </div>
        </div>
    </template>
</div>
