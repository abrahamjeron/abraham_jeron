<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';

    let orders = [];
    let filteredOrders = [];
    let searchTerm = '';
    let loading = true;
    let error = null;

    $: {
        // Reactive statement to filter orders whenever searchTerm changes
        if (orders) {
            filteredOrders = orders.filter(order => {
                const customerName = order.customer?.name || 'Anonymous';
                return customerName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
    }

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

            if (res.ok) {
                const data = await res.json();
                console.log('Orders data:', data);
                orders = data || [];
                filteredOrders = orders; // Initialize filteredOrders with all orders
            } else {
                const errorData = await res.json().catch(() => ({}));
                error = errorData.message || 'Failed to fetch orders';
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
            case 0:
                return 'Cancelled';
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
            case 0:
                return 'bg-[#FEEAE0] text-red-600';
            case 9:
                return 'bg-[#DEFCEE] text-green-600';
            case 10:
                return 'bg-[#FEEAE0] text-red-600';
            case 12:
                return 'bg-[#F2EBFF] text-[#5A3EB4]';
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
    {:else}
        <input 
            type="text" 
            class="w-full p-2 border-2 border-gray-200 mb-4" 
            placeholder="Search orders by username" 
            bind:value={searchTerm}
        />

        <div class="grid grid-cols-6 gap-4 mb-4 px-4 text-sm font-medium text-gray-500">
            <div class="col-span-2">Customer</div>
            <div class="text-center">Created</div>
            <div class="text-center">Kiosk</div>
            <div class="text-center">Status</div>
            <div class="text-center">Amount</div>
        </div>

        <div class="grid">
            {#each filteredOrders as order}
                <button 
                    class="w-full p-4 border-b-2 border-gray-200 hover:shadow-md transition-shadow"
                    on:click={() => goto(`/orders/${order.id}`)}
                >
                    <div class="grid grid-cols-6 gap-4 items-center">
                        <div class="col-span-2 text-left">
                            <h3 class="text-lg font-semibold text-gray-900">{order.customer?.name || 'Anonymous'}</h3>
                            <p class="text-sm text-gray-500">#{order.id}</p>
                        </div>

                        <div class="text-center">
                            <p class="text-gray-900">{new Date(order.created.at).toLocaleDateString()}</p>
                        </div>

                        <div class="text-center">
                            <p class="text-gray-900">{order.kiosk.code}</p>
                        </div>

                        <div class="text-center">
                            <span class={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status.id)}`}>
                                {getStatusText(order.status.id)}
                            </span>
                        </div>

                        <div class="text-center">
                            <p class="text-gray-900">{order.amount.value.toFixed(2)} {order.amount.currency}</p>
                        </div>
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>
