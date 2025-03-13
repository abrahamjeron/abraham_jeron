<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';

    let orders = [];
    let loading = true;
    let error = null;

    onMount(async () => {
        // Check if user is authenticated
        const auth = authStore.get();
        if (!auth?.token) {
            goto('/auth/request-otp');
            return;
        }

        try {
            const res = await fetch('/api/v2/orders', {
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.status === 200) {
                const data = await res.json();
                orders = data.orders || [];
            } else {
                try {
                    const errorData = await res.json();
                    error = errorData.message || 'Failed to fetch orders';
                } catch {
                    error = 'Failed to fetch orders';
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            error = 'Network error. Please try again.';
        } finally {
            loading = false;
        }
    });
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Today's Orders</h1>

    {#if loading}
        <div class="text-center">Loading orders...</div>
    {:else if error}
        <div class="text-red-500 text-center">{error}</div>
    {:else if orders.length === 0}
        <div class="text-center">No orders for today</div>
    {:else}
        <div class="grid gap-4">
            {#each orders as order}
                <div class="border rounded-lg p-4 shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="font-semibold">Order #{order.id}</h2>
                            <p class="text-gray-600">Status: {order.status}</p>
                            <p class="text-gray-600">Total: ${order.total}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <div class="mt-2">
                        <h3 class="font-medium">Items:</h3>
                        <ul class="list-disc list-inside">
                            {#each order.items as item}
                                <li>{item.name} x {item.quantity}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
