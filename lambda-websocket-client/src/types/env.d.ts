declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_AWS_WEBSOCKET_ENDPOINT: string;
  }
} 