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

        console.log('Sign In Request body:', requestBody);

        const signInRes = await fetch('/api/v2/collaborators?action=sign-in', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Sign In Response status:', signInRes.status);
        console.log('Sign In Response headers:', Object.fromEntries(signInRes.headers));

        if (signInRes.status === 200) {
            try {
                const signInData = await signInRes.json();
                console.log('Sign In data:', signInData);
                authStore.set({ 
                    token: signInData.token,
                    user: signInData.user
                });
                goto('/orders');
            } catch (error) {
                console.error('Error parsing sign-in response:', error);
                alert('Failed to process sign-in response. Please try again.');
            }
        } else {
            try {
                const responseClone = signInRes.clone();
                const contentType = signInRes.headers.get('content-type');
                
                if (contentType?.includes('application/json')) {
                    const errorData = await responseClone.json();
                    console.log('Sign In Error data:', errorData);
                    alert(`Failed to sign in: ${errorData.message || 'Unknown error'}`);
                } else {
                    const errorText = await signInRes.text();
                    console.log('Sign In Error text:', errorText);
                    alert(`Failed to sign in: ${errorText || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error handling sign-in response:', error);
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