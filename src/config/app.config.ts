
//Second method of using custom config files asides registerAs namespaced config in db config file
export const appConfig = () => ({
    environment: {
        apiVersion: process.env.API_VERSION
    }
});

