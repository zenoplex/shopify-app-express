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
      SHOPIFY_APP_SCOPE: 'read_products' | 'write_orders' | 'read_orders';
      SESSION_SECRET: string;
    }
  }
}
