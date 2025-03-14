<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    let order = null;
    let loading = true;
    let error = null;

    async function fetchOrderDetails() {
        const auth = get(authStore);
        if (!auth?.token) {
            goto('/auth/request-otp');
            return;
        }

        const orderId = $page.params.orderId;
        if (!orderId) {
            error = 'Order ID is missing';
            loading = false;
            return;
        }

        try {
            const res = await fetch(`/api/v2/orders/${orderId}/items`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                order = data[0];
            } else {
                const errorData = await res.json().catch(() => ({}));
                error = errorData.message || 'Failed to fetch order details';
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            error = 'Network error. Please try again.';
        } finally {
            loading = false;
        }
    }

    let cancelling = false;

async function cancelOrder() {
    if (cancelling) return; // Prevent duplicate requests
    cancelling = true;
    const orderId = $page.params.orderId;
    const auth = get(authStore);
    try {
        const res = await fetch(`/api/v2/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({
                "status": { "id": 0 }
            })
        });

        if (res.ok) {
            alert('Order cancelled successfully');
            goto(`/orders/`);
        } else {
            const errorData = await res.json().catch(() => ({}));
            error = errorData.message || 'Failed to cancel order';
            console.log(error);
        }
    } catch (err) {
        console.error('Error cancelling order:', err);
        error = 'Network error. Please try again.';
    } finally {
        cancelling = false;
    }
}


    onMount(fetchOrderDetails);
</script>

<div class="p-6">
    {#if loading}
        <div class="text-center p-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p class="mt-2">Loading order details...</p>
        </div>
    {:else if error}
        <div class="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
    {:else if order}
        <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h1 class="text-2xl font-bold">Order #{order.order.id}</h1>

            <div>
                <h2 class="text-lg font-semibold mb-2">Offer Details</h2>
                <p><span class="font-medium">Offer Name:</span> {order.offer.name}</p>
                <p><span class="font-medium">Offer Reference:</span> {order.offer.reference}</p>
                <p><span class="font-medium">Quantity:</span> {order.quantity}</p>
                <p><span class="font-medium">Price:</span> ${order.price.toFixed(2)}</p>
                <p><span class="font-medium">VAT:</span> {order.vat}</p>
            </div>

            <button 
            on:click={cancelOrder} 
            class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            disabled={cancelling}
        >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
        </div>
    {:else}
        <div class="text-center p-4 bg-gray-50 rounded-lg">Order not found</div>
    {/if}
</div>
