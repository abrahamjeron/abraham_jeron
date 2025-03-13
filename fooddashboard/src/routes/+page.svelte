<script>
    import { goto } from '$app/navigation';

    function handleGetStarted() {
        goto('/auth/request-otp');
    }
</script>

<div class="flex flex-col items-center justify-center h-screen bg-blue-50 p-6">
    <h1 class="text-3xl font-bold text-blue-600">Welcome to Mighty Orders</h1>
    <p class="text-gray-600 mt-2 text-center">
        Manage your orders with ease. Start by signing in with your mobile number.
    </p>

    <button 
        on:click={handleGetStarted}
        class="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transition">
        Get Started
    </button>
</div>
