import { data } from 'react-router';

export type TypedResponse<T = unknown> = Omit<Response, 'json'> & {
  json(): Promise<T>;
};

type DataFunctionResult<T> = T extends (...args: any[]) => infer Result
  ? Awaited<Result>
  : Awaited<T>;

export type SerializeFrom<T> =
  DataFunctionResult<T> extends TypedResponse<infer Data>
    ? Data
    : DataFunctionResult<T> extends TypedDeferredData<infer Data>
      ? Data
      : DataFunctionResult<T>;

export type TypedDeferredData<Data extends Record<string, unknown>> =
  ReturnType<typeof data<Data>> & {
    type: 'DataWithResponseInit';
    data: Data;
  };

export type JsonFunction = <Data>(
  value: Data,
  init?: number | ResponseInit
) => TypedResponse<Data>;

export type DeferFunction = <Data extends Record<string, unknown>>(
  value: Data,
  init?: number | ResponseInit
) => TypedDeferredData<Data>;

const normalizeResponseInit = (init?: number | ResponseInit): ResponseInit =>
  typeof init === 'number' ? { status: init } : (init ?? {});

export const json: JsonFunction = (value, init) => {
  const responseInit = normalizeResponseInit(init);
  const headers = new Headers(responseInit.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }
  return new Response(JSON.stringify(value), {
    ...responseInit,
    headers,
  }) as TypedResponse<typeof value>;
};

export const defer: DeferFunction = (value, init) =>
  data(value, init) as TypedDeferredData<typeof value>;
