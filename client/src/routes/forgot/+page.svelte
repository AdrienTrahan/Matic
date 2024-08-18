<script>
    import { goto } from "$app/navigation";


    import { user } from "$framework/auth"

    let errorMessage = "";
    let successMessage = "";
    let userData = {
        email: "",
    }

    async function recoverAccount(){
        errorMessage = "";
        successMessage = ""
        const [data, error] = await user.recoverAccount(userData);
        if (error) return errorMessage = error.reason ?? error
        successMessage = "Sent!"
    }
</script>
<h1>Forgot password?</h1>
<a href="/login">go to login</a>
<br>
<input type="text" placeholder="email" bind:value={userData.email}>
<br>
<p>{errorMessage}</p>
<p>{successMessage}</p>
<button on:click={recoverAccount}>
    Send email
</button> 