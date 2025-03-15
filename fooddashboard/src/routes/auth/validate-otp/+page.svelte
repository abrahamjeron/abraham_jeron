<script>
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore.js';
    import Logo from '../../../assets/Logo.svg'

    export let data;

    let otpCode = ['', '', '', ''];

    function handleInput(event, index) {
        const value = event.target.value;
        if (/\d/.test(value)) {
            otpCode[index] = value;
            if (index < 3) {
                document.getElementById(`otp-input-${index + 1}`).focus();
            }
        } else {
            otpCode[index] = '';
        }
    }

    async function validateOTP() {
        const enteredOTP = otpCode.join('');

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
                code: enteredOTP
            }
        };

        console.log('Request body:', requestBody);

        const validateRes = await fetch('/api/v2/collaborators?action=validate-otp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (validateRes.status === 204) {
            goto(`/auth/sign-in?countryCode=${encodeURIComponent(data.countryCode)}&phoneNumber=${encodeURIComponent(data.phoneNumber)}`);
        } else {
            alert('Failed to validate OTP. Please try again.');
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
                Please enter the OTP you received in<br>your phone number
            </h1>

            <div class="flex justify-center gap-4 mb-10">
                {#each otpCode as _, index}
                    <div class="relative">
                        <input
                            id={`otp-input-${index}`}
                            type="text"
                            maxlength="1"
                            class="w-12 h-14 text-center text-xl border-b-2 border-black focus:outline-none focus:border-blue-500"
                            bind:value={otpCode[index]}
                            on:input={(event) => handleInput(event, index)}
                        />
                    </div>
                {/each}
            </div>

            <button 
                on:click={validateOTP} 
                class="w-full border-2 p-3 rounded-2xl bg-white text-black hover:text-white hover:bg-black transition-colors duration-200"
            >
                Verify OTP
            </button>
        </div>
    </div>
</div>
