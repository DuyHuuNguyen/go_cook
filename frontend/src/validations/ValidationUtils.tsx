

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/


export function validEmail(email: string){
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Invalid email format'
        }
    }
    return {
        success: true
    }
}

export function validPassword(password: string){
    if (!passwordRegex.test(password)) {
        return{
            success: false,
            message: 'Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character'
        }
    }
    return {
        success: true
    }
}