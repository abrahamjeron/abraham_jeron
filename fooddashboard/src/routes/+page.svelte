<script>
    import { goto } from '$app/navigation';
    import Logo from '../assets/Logo.svg';

    function handleGetStarted() {
        goto('/auth/request-otp');
    }
</script>

<!-- Logo header -->
<div class="fixed top-0 w-full flex gap-x-2 p-4 sm:p-5 bg-white">
    <img src={Logo} alt="Logo" class="h-8 sm:h-auto"> 
    <h1 class="text-[1.1rem] sm:text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
</div>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6">
    <h1 class="text-2xl sm:text-3xl font-bold text-center">Welcome to MIGHTY X ABRA</h1>
    <p class="text-gray-600 mt-4 text-center max-w-md text-sm sm:text-base">
        Experience seamless order management with our intuitive dashboard. Sign in with your phone number to get started.
    </p>
    <p class="text-gray-500 mt-2 text-center text-xs sm:text-sm">
        Your one-stop solution for efficient order tracking and management.
    </p>

    <button 
        on:click={handleGetStarted}
        class="w-full sm:w-auto bg-white border-2 border-black text-black rounded-2xl px-4 sm:px-6 py-2.5 mt-6 hover:bg-black hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Get Started
    </button>
</div>
