import axios from "axios";


const baseURL = typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

const AxiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to attach the session cookie
AxiosClient.interceptors.request.use(
    async (config) => {
        // Check if we are running on the server
        if (typeof window === "undefined") {
            try {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const sessionCookie = cookieStore.get('token_gudang'); // Adjust cookie name if needed
                if (sessionCookie) {
                    config.headers.Cookie = `${sessionCookie.name}=${sessionCookie.value}`;
                }
            } catch (error) {
                // Ignore error: cookies() cannot be called in Client Component SSR
                // The request will likely go to the proxy which handles cookies
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default AxiosClient;
