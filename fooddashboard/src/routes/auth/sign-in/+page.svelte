<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';

    export let data;

    let otpCode = '';

    async function signIn() {
        if (!data?.countryCode || !data?.phoneNumber) {
            alert('Phone number data is missing. Please try requesting OTP again.');
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

        const signInRes = await fetch('/api/v2/collaborators?action=sign-in', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (signInRes.status === 200) {
            try {
                const signInData = await signInRes.json();

                authStore.set({ token: signInData.token });

                // Safe check for browser environment before using localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('authToken', signInData.token);
                }

                goto('/orders');
            } catch (error) {
                console.error('Error parsing sign-in response:', error);
                alert('Failed to process sign-in response. Please try again.');
            }
        } else {
            try {
                const errorData = await signInRes.json();
                alert(`Failed to sign in: ${errorData.message || 'Unknown error'}`);
            } catch (error) {
                alert('Failed to process sign-in response. Please try again.');
            }
        }
    }
</script>



<div class="flex flex-col items-center p-6">
    <h1 class="text-2xl font-bold">Sign In</h1>

    <input
        type="text"
        bind:value={otpCode}
        placeholder="Enter OTP"
        class="input"
    />

    <button on:click={signIn} class="btn-primary mt-4">
        Sign In
    </button>
</div> 