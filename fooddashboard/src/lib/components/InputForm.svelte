<script>
    import { requestOTP } from '$lib/utils/api.js';
    import { goto } from '$app/navigation';

    let countryCode = '';
    let number = '';

    async function handleSubmit() {
        const phone = { countryCode, number };
        const success = await requestOTP(phone);
        if (success) {
            goto('/otp');
        } else {
            alert('Failed to request OTP');
        }
    }
</script>

<div class="p-4">
    <input bind:value={countryCode} placeholder="Country Code" class="p-2 border rounded w-full" />
    <input bind:value={number} placeholder="Mobile Number" class="p-2 border rounded w-full mt-2" />
    <button on:click={handleSubmit} class="bg-blue-500 text-white p-2 mt-4 rounded w-full">Request OTP</button>
</div>
