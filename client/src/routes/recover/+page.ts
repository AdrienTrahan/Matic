import { user } from '$framework/auth.js'
import { redirect } from '@sveltejs/kit';

export async function load({url: {searchParams}}){
    const data = Object.fromEntries(searchParams)
    const status = await user.checkRecoveryCode(data);

    if (!data.email) throw redirect(300, "/login")
    if (!data.recovery) throw redirect(300, "/login")
        
    return {
        data,
        status: {
            valid: !!status[0]?.success,
            message: status[1]?.reason
        }
    }
}