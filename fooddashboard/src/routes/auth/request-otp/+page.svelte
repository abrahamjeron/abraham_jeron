<script>
    import { goto } from '$app/navigation';

    let countryCode = '91';
    let phoneNumber = '';
    async function requestOTP() {
    if (!phoneNumber || phoneNumber.length < 10) {
        alert('Please enter a valid phone number.');
        return;
    }

    try {
        const res = await fetch('/api/v2/collaborators?action=request-otp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                phone: {
                    countryCode: countryCode,
                    number: phoneNumber
                }
            })
        });

        if (res.status === 204) {
            goto(`/auth/validate-otp?countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(phoneNumber)}`);
        } else {
            const responseClone = res.clone();
            try {
                const errorData = await responseClone.json();
                alert(`Failed to request OTP: ${errorData.message || 'Unknown error'}`);
            } catch (parseError) {
                const errorText = await res.text();
                alert(`Failed to request OTP: ${errorText || 'Unknown error'}`);
            }
        }
    } catch (error) {
        console.error('Error requesting OTP:', error);
        alert('Network error. Please try again.');
    }
}


</script>

<div class="flex flex-col items-center p-6">
    <h1 class="text-2xl font-bold">Request OTP</h1>

    <input 
        type="text" 
        bind:value={countryCode}
        placeholder="Country Code"
        class="input"
    />

    <input 
        type="text" 
        bind:value={phoneNumber}
        placeholder="Mobile Number"
        class="input mt-4"
    />

    <button on:click={requestOTP} class="btn-primary mt-4">
        Request OTP
    </button>
</div>
