
//Second method of using custom config files asides registerAs namespaced config in db config file
export const appConfig = () => ({
    environment: {
        apiVersion: process.env.API_VERSION,
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiry: process.env.JWT_EXPIRY,
        paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
        frontendBaseUrl: process.env.FRONTEND_URL
    }
});

