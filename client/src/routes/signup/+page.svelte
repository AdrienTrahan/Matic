<!-- @format -->
<script>
    import { goto } from "$app/navigation"
    import { user } from "$framework/auth"

    let errorMessage = ""
    let userData = {
        firstname: "",
        lastname: "",
        email: "",
        password: "",
    }

    async function signup() {
        errorMessage = ""
        const [data, error] = await user.signup(userData)
        if (error) return (errorMessage = error.reason ?? error)
        goto("/projects")
    }
</script>

<h1>Signup</h1>
<a href="/login">go to login</a>
<br />
<input type="text" placeholder="first" bind:value={userData.firstname} />
<br />
<input type="text" placeholder="last" bind:value={userData.lastname} />
<br />
<input type="text" placeholder="email" bind:value={userData.email} />
<br />
<input type="text" placeholder="password" bind:value={userData.password} />
<br />
<p>{errorMessage}</p>
<button on:click={signup}> Signup </button>
