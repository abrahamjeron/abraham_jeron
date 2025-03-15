<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import Logo from '../../../assets/Logo.svg';

    export let data;

    let otpDigits = ['', '', '', '']; // Array to store individual OTP digits
    let otpInputRefs = []; // Array to store references to input elements
    let error = ''; // For error messages

    // Combine digits to get full OTP
    $: otpCode = otpDigits.join('');

    function handleInput(index, event) {
        const value = event.target.value;
        if (/\d/.test(value)) {
            otpDigits[index] = value;
            if (index < 3) {
                otpInputRefs[index + 1].focus();
            }
        } else {
            otpDigits[index] = '';
        }
        otpDigits = [...otpDigits]; // Trigger reactivity
    }

    function handleKeydown(index, event) {
        // Handle backspace
        if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputRefs[index - 1].focus();
        }
    }

    function handlePaste(event) {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text');
        const numbers = pastedData.replace(/\D/g, '').slice(0, 4).split('');
        
        otpDigits = [...otpDigits.map((_, index) => numbers[index] || '')];
        
        // Focus the next empty input or the last input
        const nextEmptyIndex = otpDigits.findIndex(digit => !digit);
        if (nextEmptyIndex !== -1) {
            otpInputRefs[nextEmptyIndex].focus();
        } else if (otpDigits[3]) {
            otpInputRefs[3].focus();
        }
    }

    async function signIn() {
        error = ''; // Clear previous errors
        
        if (!data?.countryCode || !data?.phoneNumber) {
            error = 'Phone number data is missing. Please try requesting OTP again.';
            goto('/auth/request-otp');
            return;
        }

        const requestBody = {
            phone: {
                countryCode: data.countryCode,
                number: data.phoneNumber
            },
            otp: {
                code: otpCode
            }
        };

        try {
            const signInRes = await fetch('/api/v2/collaborators?action=sign-in', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (signInRes.status === 200) {
                const signInData = await signInRes.json();
                authStore.set({ token: signInData.token });

                // Safe check for browser environment before using localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('authToken', signInData.token);
                }

                goto('/orders');
            } else {
                const errorData = await signInRes.json();
                error = errorData.message || 'Failed to sign in. Please try again.';
            }
        } catch (err) {
            console.error('Error during sign in:', err);
            error = 'Network error. Please check your connection and try again.';
        }
    }
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Logo header -->
    <div class="flex gap-x-2 p-5">
        <img src={Logo} alt="Logo"> 
        <h1 class="text-[1.3rem] font-bold">MIGHTY X ABRA</h1>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div class="bg-white rounded-lg shadow-md w-full max-w-md p-8">
            <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">
                Enter the OTP to<br>sign in to your account
            </h1>

            <div class="flex justify-center gap-4 mb-10">
                {#each otpDigits as _, index}
                    <div class="relative">
                        <input
                            id={`otp-input-${index}`}
                            type="text"
                            maxlength="1"
                            class="w-12 h-14 text-center text-xl border-b-2 border-black focus:outline-none focus:border-blue-500"
                            bind:value={otpDigits[index]}
                            bind:this={otpInputRefs[index]}
                            on:input={(e) => handleInput(index, e)}
                            on:keydown={(e) => handleKeydown(index, e)}
                            on:paste={handlePaste}
                            inputmode="numeric"
                        />
                    </div>
                {/each}
            </div>

            <button 
                on:click={signIn} 
                class="w-full border-2 p-3 rounded-2xl bg-white text-black hover:text-white hover:bg-black transition-colors duration-200"
                disabled={otpCode.length !== 4}
            >
                Sign In
            </button>

            {#if error}
                <p class="text-red-500 text-center mt-4">{error}</p>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Remove spinner buttons from number inputs */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }


    /* Remove background color when autofilled */
    input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
    }
</style> 