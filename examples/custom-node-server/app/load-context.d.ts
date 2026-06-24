import 'react-router';

declare module 'react-router' {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}
