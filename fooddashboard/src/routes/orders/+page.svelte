<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    let orders = [];
    let loading = true;
    let error = null;

    onMount(async () => {
        const auth = get(authStore);
        if (!auth?.token) {
            goto('/auth/request-otp');
            return;
        } else {
            console.log("Auth Token: ", auth.token);
        }

        try {
            const queryParams = new URLSearchParams({
                onlyOrders: 'true',
                period: "YESTERDAY"
            }).toString();

            const requestURL = `/api/v2/orders?${queryParams}`;

            console.log('Request URL:', requestURL);

            const res = await fetch(requestURL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            console.log('Response status:', res.status);
            console.log('Response headers:', Object.fromEntries(res.headers));

            if (res.ok) {
                const data = await res.json();
                console.log('Orders data:', data);
                orders = data || [];
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.log('Error data:', errorData);
                if (errorData.detail?.id === 'document-not-listed') {
                    error = 'No orders found for today';
                } else {
                    error = errorData.message || 'Failed to fetch orders';
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            error = 'Network error. Please try again.';
        } finally {
            loading = false;
        }
    });

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function getStatusText(statusId) {
        switch (statusId) {
            case 9:
                return 'Paid';
            case 10:
                return 'Pending Payment';
            case 12:
                return 'Fulfilled';
            default:
                return 'Unknown';
        }
    }

    function getStatusColor(statusId) {
        switch (statusId) {
            case 9:
                return 'text-yellow-600';
            case 10:
                return 'text-red-600';
            case 12:
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Today's Orders</h1>

    {#if loading}
        <div class="text-center p-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p class="mt-2">Loading orders...</p>
        </div>
    {:else if error}
        <div class="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
    {:else if orders.length === 0}
        <div class="text-center p-4 bg-gray-50 rounded-lg">No orders for today</div>
    {:else}
        <div class="grid gap-4">
            {#each orders as order}
            <button class="border-2 " on:click={()=>goto(`/orders/${order.id}`)}>
                <div class="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <h2 class="font-semibold text-lg">Order #{order.id}</h2>
                                <span class={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status.id)}`}>
                                    {getStatusText(order.status.id)}
                                </span>
                            </div>
                            <div class="text-gray-600">
                                <p class="text-sm">
                                    <span class="font-medium">Customer:</span> 
                                    {order.customer?.name || 'Anonymous'}
                                </p>
                                <p class="text-sm">
                                    <span class="font-medium">Kiosk:</span> 
                                    {order.kiosk.code}
                                </p>
                                <p class="text-sm">
                                    <span class="font-medium">Amount:</span> 
                                    {order.amount.value.toFixed(2)} {order.amount.currency}
                                </p>
                            </div>
                        </div>
                        <div class="text-right space-y-1">
                            <p class="text-sm text-gray-500">Created: {formatDate(order.created.at)}</p>
                            {#if order.paid.at}
                                <p class="text-sm text-gray-500">Paid: {formatDate(order.paid.at)}</p>
                            {/if}
                            {#if order.fulfilled.at}
                                <p class="text-sm text-gray-500">Fulfilled: {formatDate(order.fulfilled.at)}</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </button>
            {/each}
        </div>
    {/if}
</div>
