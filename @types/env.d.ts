// To prevent augmentations for the global scope error
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      SHOPIFY_API_KEY: string;
      SHOPIFY_API_SECRET_KEY: string;
      // https://shopify.dev/docs/admin-api/access-scopes
      SHOPIFY_APP_SCOPE: string;
      // Baes url for app
      SHOPIFY_APP_URL: string;
      // App URL after auth, defaults to SHOPIFY_APP_URL/app?shop=xxx
      SHOPIFY_APP_INITIAL_URL: string;
      // Set URL to enable redis
      REDIS_URL: string;
    }
  }
}
