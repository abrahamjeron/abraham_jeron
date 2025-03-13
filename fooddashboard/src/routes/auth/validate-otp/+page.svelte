<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';

    export let data;

    let otpCode = '';

    async function validateOTP() {
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

        console.log('Request body:', requestBody);

        // First validate OTP
        const validateRes = await fetch('/api/v2/collaborators?action=validate-otp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Validate OTP Response status:', validateRes.status);
        console.log('Validate OTP Response headers:', Object.fromEntries(validateRes.headers));

        if (validateRes.status === 204) {
            // If OTP is valid, redirect to sign-in page
            goto(`/auth/sign-in?countryCode=${encodeURIComponent(data.countryCode)}&phoneNumber=${encodeURIComponent(data.phoneNumber)}`);
        } else {
            try {
                const responseClone = validateRes.clone();
                const contentType = validateRes.headers.get('content-type');
                
                if (contentType?.includes('application/json')) {
                    const errorData = await responseClone.json();
                    console.log('Validate OTP Error data:', errorData);
                    alert(`Failed to validate OTP: ${errorData.message || 'Unknown error'}`);
                } else {
                    const errorText = await validateRes.text();
                    console.log('Validate OTP Error text:', errorText);
                    alert(`Failed to validate OTP: ${errorText || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error handling validate OTP response:', error);
                alert('Failed to process response. Please try again.');
            }
        }
    }
</script>

<div class="flex flex-col items-center p-6">
    <h1 class="text-2xl font-bold">Enter OTP</h1>

    <input
        type="text"
        bind:value={otpCode}
        placeholder="Enter OTP"
        class="input"
    />

    <button on:click={validateOTP} class="btn-primary mt-4">
        Verify OTP
    </button>
</div>
