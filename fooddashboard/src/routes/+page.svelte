<script>
    import { goto } from '$app/navigation';
    import Logo from '../assets/Logo.svg';

    function handleGetStarted() {
        goto('/auth/request-otp');
    }
</script>

<!-- Logo header -->
<div class="fixed top-0 w-full flex gap-x-2 p-5">
    <img src={Logo} alt="Logo"> 
    <h1 class="text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
</div>

<div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-center">Welcome to MIGHTY X ABRA</h1>
    <p class="text-gray-600 mt-4 text-center max-w-md">
        Manage your order list easily. Continue by signing in with your number.   </p>

    <button 
        on:click={handleGetStarted}
        class="bg-white border-2 border-black text-black rounded-2xl px-6 py-2.5 mt-6 hover:bg-black hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Get Started
    </button>
</div>
