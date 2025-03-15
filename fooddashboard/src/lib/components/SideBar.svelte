<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import { get } from 'svelte/store';
    import Logo from '../../assets/Logo.svg';

    function handleLogout() {
        try {
            // Get current auth state
            const auth = get(authStore);
            
            // Clear the auth store first
            authStore.set(null);
            
            // Clear both localStorage items
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth');
                localStorage.removeItem('authToken');
            }
            
            // Redirect to login
            goto('/auth/request-otp');
        } catch (error) {
            console.error('Error during logout:', error);
            goto('/auth/request-otp');
        }
    }
</script>

<div class="w-1/5 h-screen  flex flex-col">
    <!-- Logo header -->
    <div class="flex items-center gap-x-2 p-5 ">
        <img src={Logo} alt="Logo" class="h-8 w-auto"> 
        <h1 class="text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-6 bg-white">
        <a 
            href="/orders" 
            class="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
            Orders
        </a>
    </nav>

    <!-- Logout Button -->
    <div class="p-6 border-t bg-white border-gray-200">
        <button 
            class="w-full py-2 px-4 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            on:click={handleLogout}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 6.707 6.293a1 1 0 00-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 101.414 1.414L10 12.414l3.293 3.293a1 1 0 001.414-1.414L11.414 11l3.293-3.293z" clip-rule="evenodd" />
            </svg>
            Logout
        </button>
    </div>
</div>