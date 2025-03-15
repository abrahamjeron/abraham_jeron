<script>
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore.js';
    import { goto } from '$app/navigation';
    import { get } from 'svelte/store';
    import SideBar from '$lib/components/SideBar.svelte';
    import Logo from '../../assets/Logo.svg';

    let orders = [];
    let filteredOrders = [];
    let searchTerm = '';
    let statusFilter = '';
    let loading = true;
    let error = null;
    let showMenu = false;

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

    function handleToggleMenu() {
        showMenu = !showMenu;
    }
</script>

<div class="flex h-screen bg-gray-100">
    <SideBar 
        bind:showMenu
        on:toggleMenu={handleToggleMenu}
    />
    
    <div class="flex-1 flex flex-col w-full">
        <!-- Mobile Header -->
        <div class="sm:hidden flex items-center justify-between p-4 bg-white border-b">
            <div class="flex items-center gap-x-2">
                <img src={Logo} alt="Logo" class="h-6 w-auto"> 
                <h1 class="text-[1.1rem] font-bold">MIGHTY X ABRA</h1>
            </div>
            <button 
                class="p-2 hover:bg-gray-100 rounded-lg"
                on:click={handleToggleMenu}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </div>

        <!-- Desktop Header -->
        <div class="hidden sm:block p-6 pb-0">
            <h1 class="text-2xl font-bold mb-6">Today's Orders</h1>
        </div>
            
        {#if loading}
            <div class="text-center p-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p class="mt-2">Loading orders...</p>
            </div>
        {:else if error}
            <div class="text-red-500 text-center p-4 bg-red-50 rounded-lg mx-4">{error}</div>
        {:else}
            <!-- Search and Filter Section -->
            <div class="p-4 space-y-3">
                <div class="bg-white rounded-lg p-4 space-y-3">
                    <input 
                        type="text" 
                        class="w-full p-3 border-2 border-gray-200 rounded-lg text-sm" 
                        placeholder="Search orders by customer name" 
                        bind:value={searchTerm}
                    />

                    <select 
                        class="w-full p-3 border-2 border-gray-200 rounded-lg text-sm" 
                        bind:value={statusFilter}
                    >
                        {#each statusOptions as status}
                            <option value={status.id}>{status.label}</option>
                        {/each}
                    </select>
                </div>

                <!-- Desktop Table Header -->
                <div class="hidden sm:grid grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                    <div class="col-span-2">Customer</div>
                    <div class="text-center">Created</div>
                    <div class="text-center">Kiosk</div>
                    <div class="text-center">Status</div>
                    <div class="text-center">Amount</div>
                </div>
            </div>

            <!-- Orders List -->
            <div class="flex-1 overflow-auto px-4 pb-4">
                <div class="grid gap-3">
                    {#each filteredOrders as order}
                        <button 
                            class="w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            on:click={() => goto(`/orders/${order.id}`)}
                        >
                            <!-- Mobile Layout -->
                            <div class="sm:hidden p-4 space-y-3">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="text-base font-semibold text-gray-900">{order.customer?.name || 'Anonymous'}</h3>
                                        <div class="flex items-center gap-2 mt-1">
                                            <span class="text-xs text-gray-500">#{order.id}</span>
                                            <span class="text-xs text-gray-500">•</span>
                                            <span class="text-xs text-gray-500">{order.kiosk.code}</span>
                                        </div>
                                    </div>
                                    <span class={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status.id)}`}>
                                        {getStatusText(order.status.id)}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center text-sm">
                                    <div class="flex items-center text-gray-500 text-xs">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {new Date(order.created.at).toLocaleDateString()}
                                    </div>
                                    <span class="font-medium">{order.amount.value.toFixed(2)} {order.amount.currency}</span>
                                </div>
                            </div>

                            <!-- Desktop Layout -->
                            <div class="hidden sm:grid grid-cols-6 gap-4 items-center p-4">
                                <div class="col-span-2 text-left">
                                    <h3 class="text-base font-semibold text-gray-900">{order.customer?.name || 'Anonymous'}</h3>
                                    <p class="text-sm text-gray-500">#{order.id}</p>
                                </div>

                                <div class="text-center">
                                    <p class="text-sm text-gray-900">{new Date(order.created.at).toLocaleDateString()}</p>
                                </div>

                                <div class="text-center">
                                    <p class="text-sm text-gray-900">{order.kiosk.code}</p>
                                </div>

                                <div class="text-center">
                                    <span class={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status.id)}`}>
                                        {getStatusText(order.status.id)}
                                    </span>
                                </div>

                                <div class="text-center">
                                    <p class="text-sm text-gray-900">{order.amount.value.toFixed(2)} {order.amount.currency}</p>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
