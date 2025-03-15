<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import { get } from 'svelte/store';
    import Logo from '../../assets/Logo.svg';
    import OrdersIcon from '../../assets/Orders.svg';
    import Logout from '../../assets/Logout.svg';

    export let showMenu = false;

    // Create a dispatch function to communicate with parent
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function toggleMenu() {
        dispatch('toggleMenu');
    }

    function handleLogout() {
        try {
            const auth = get(authStore);
            authStore.set(null);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth');
                localStorage.removeItem('authToken');
            }

            goto('/auth/request-otp');
        } catch (error) {
            console.error('Error during logout:', error);
            goto('/auth/request-otp');
        }
    }
</script>

<!-- Desktop Sidebar -->
<div class="hidden sm:flex w-1/5 h-screen flex-col bg-white">
    <div class="flex items-center gap-x-2 p-5">
        <img src={Logo} alt="Logo" class="h-8 w-auto"> 
        <h1 class="text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
    </div>

    <nav class="flex-1 p-6">
        <a 
            href="/orders" 
            class="flex space-x-[20px] py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <img src={OrdersIcon} alt=""> 
            <p class="text-[1.2rem] font-bold">Orders</p>
        </a>
    </nav>

    <div class="p-6 border-t border-gray-200">
        <button 
            class="flex space-x-[20px] py-2 px-4 text-gray-700 hover:bg-gray-100 w-full rounded-lg transition-colors"
            on:click={handleLogout}
        >
            <img src={Logout} alt="">
            <p class="text-[1.2rem] font-bold">Logout</p>
        </button>
    </div>
</div>

<!-- Mobile Menu -->
{#if showMenu}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 sm:hidden" on:click={toggleMenu}>
        <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-lg" on:click|stopPropagation>
            <div class="p-4 flex justify-end border-b">
                <button 
                    class="p-2 hover:bg-gray-100 rounded-lg"
                    on:click={toggleMenu}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <nav class="p-4">
                <a 
                    href="/orders" 
                    class="flex items-center space-x-[20px] py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    on:click={toggleMenu}
                >
                    <img src={OrdersIcon} alt=""> 
                    <p class="text-[1.2rem] font-bold">Orders</p>
                </a>
                <button 
                    class="flex items-center space-x-[20px] py-2 px-4 text-gray-700 hover:bg-gray-100 w-full rounded-lg transition-colors mt-2"
                    on:click={handleLogout}
                >
                    <img src={Logout} alt="">
                    <p class="text-[1.2rem] font-bold">Logout</p>
                </button>
            </nav>
        </div>
    </div>
{/if}
