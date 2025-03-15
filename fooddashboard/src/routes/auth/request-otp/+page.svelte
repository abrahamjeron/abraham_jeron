<script>
    import { goto } from '$app/navigation';
    import Logo from '../../../assets/Logo.svg';

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
                Enter your phone number to<br>receive OTP
            </h1>

            <div class="flex gap-4 mb-6">
                <div class="w-1/4">
                    <input 
                        type="text" 
                        bind:value={countryCode}
                        placeholder="Code"
                        class="w-full h-14 text-center text-xl border-b-2 border-black focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div class="w-3/4">
                    <input 
                        type="text" 
                        bind:value={phoneNumber}
                        placeholder="Phone Number"
                        class="w-full h-14 text-xl px-4 border-b-2 border-black focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <button 
                on:click={requestOTP} 
                class="w-full border-2 p-3 rounded-2xl bg-white text-black hover:text-white hover:bg-black transition-colors duration-200 mt-8"
            >
                Request OTP
            </button>
        </div>
    </div>
</div>


