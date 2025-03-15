<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import SideBar from '$lib/components/SideBar.svelte';

    let orders = [];
    let filteredOrders = [];
    let searchTerm = '';
    let statusFilter = '';
    let loading = true;
    let error = null;

    const statusOptions = [
        { id: '', label: 'All Statuses' },
        { id: '0', label: 'Cancelled' },
        { id: '9', label: 'Paid' },
        { id: '10', label: 'Pending Payment' },
        { id: '12', label: 'Fulfilled' }
    ];

    $: {
        // Reactive statement to filter orders whenever searchTerm or statusFilter changes
        if (orders) {
            filteredOrders = orders.filter(order => {
                const customerName = order.customer?.name || 'Anonymous';
                const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = !statusFilter || order.status.id.toString() === statusFilter;
                return matchesSearch && matchesStatus;
            });
        }
    }

    onMount(async () => {
        const auth = get(authStore);
        if (!auth?.token) {
            goto('/auth/request-otp');
            return;
        }

        try {
            const queryParams = new URLSearchParams({
                onlyOrders: 'true',
                period: "TODAY"
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

            if (res.status === 404) {
                const retryParams = new URLSearchParams({
                    onlyOrders: 'true',
                    period: "YESTERDAY"
                }).toString();

                const retryURL = `/api/v2/orders?${retryParams}`;
                console.log('Retrying with URL:', retryURL);

                const retryRes = await fetch(retryURL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${auth.token}`
                    }
                });
                
                if (retryRes.ok) {
                    const data = await retryRes.json();
                    orders = data || [];
                    filteredOrders = orders;
                    return;
                }
            }

            if (res.ok) {
                const data = await res.json();
                orders = data || [];
                filteredOrders = orders;
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
        const status = statusOptions.find(s => s.id === statusId.toString());
        return status ? status.label : 'Unknown';
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

<div class="flex h-screen bg-gray-100">
    <SideBar />
    
    <div class="flex-1 flex flex-col">
        <!-- Static Header Section -->
        <div class="p-6 pb-0">
            <h1 class="text-2xl font-bold mb-6">Today's Orders</h1>
            
            {#if loading}
                <div class="text-center p-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p class="mt-2">Loading orders...</p>
                </div>
            {:else if error}
                <div class="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
            {:else}
                <div class="grid  gap-4 mb-4 bg-white p-4 ">
                    <input 
                        type="text" 
                        class="w-full p-2 border-2 border-gray-200 rounded-lg" 
                        placeholder="Search orders by customer name" 
                        bind:value={searchTerm}
                    />

                    <select 
                        class="w-[200px] p-2 border-2 border-gray-200 rounded-lg" 
                        bind:value={statusFilter}
                    >
                        {#each statusOptions as status}
                            <option value={status.id}>{status.label}</option>
                        {/each}
                    </select>
                </div>

                <!-- Table Header -->
                <div class="grid grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">
                    <div class="col-span-2">Customer</div>
                    <div class="text-center">Created</div>
                    <div class="text-center">Kiosk</div>
                    <div class="text-center">Status</div>
                    <div class="text-center">Amount</div>
                </div>
            {/if}
        </div>

        <!-- Scrollable Content -->
        {#if !loading && !error}
            <div class="flex-1 overflow-auto p-6 pt-0">
                <div class="grid gap-1">
                    {#each filteredOrders as order}
                        <button 
                            class="w-full p-4 bg-white border-b hover:shadow-md transition-shadow"
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
            </div>
        {/if}
    </div>
</div>
