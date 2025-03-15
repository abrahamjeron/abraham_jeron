<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import { get } from 'svelte/store';
    import Logo from '../../assets/Logo.svg';
    import OrdersIcon from '../../assets/Orders.svg';
    import Logout from '../../assets/Logout.svg';

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
    <nav class="flex-1 p-6  bg-white">
        <a 
            href="/orders" 
            class="flex space-x-[20px]  py-2 px-4 text-gray-700 hover:bg-gray-100 relative top-[10px]  transition-colors"
        >
            <img src={OrdersIcon} alt=""> <p class="text-[1.2rem] font-bold">Orders</p>
        </a>
    </nav>

    <!-- Logout Button -->
    <div class="p-6 border-t  bg-white border-gray-200">
        <button 
            class="flex space-x-[20px]  py-2 px-4 text-gray-700 hover:bg-gray-100 relative w-full  transition-colors"
            on:click={handleLogout}
        >
            <img src={Logout} alt="">
            <p class="text-[1.2rem] font-bold">Logout</p>
        </button>
    </div>
</div>