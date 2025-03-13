<script>
    import { onMount } from 'svelte';

    export let params;
    let orderDetails = {};

    async function fetchOrderDetails() {
        const res = await fetch(`/api/v2/orders/${params.id}/items`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer sample_token_value`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        orderDetails = await res.json();
    }

    async function cancelOrder() {
        await fetch(`/api/v2/orders/${params.id}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer sample_token_value`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: { id: 0 } })
        });

        alert('Order Cancelled!');
        fetchOrderDetails();
    }

    onMount(fetchOrderDetails);
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold">Order Details</h1>
    
    {#each orderDetails.items as item}
        <div class="border p-4 rounded my-2">
            <p><strong>Item Name:</strong> {item.name}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
        </div>
    {/each}

    <button on:click={cancelOrder} class="btn-danger mt-4">
        Cancel Order
    </button>
</div>
