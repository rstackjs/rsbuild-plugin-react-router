import { data, type useLoaderData } from 'react-router';

declare const typedResponseBrand: unique symbol;

export type TypedResponse<T = unknown> = Omit<Response, 'json'> & {
  json(): Promise<T>;
  readonly [typedResponseBrand]: T;
};

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type NotJson = undefined | symbol | ((...args: any[]) => unknown);
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;
type IsAny<T> = 0 extends 1 & T ? true : false;
type NonJsonBranch<T> = T extends unknown
  ? Jsonify<T> extends never
    ? T
    : never
  : never;
type JsonifyArrayValue<T> =
  | Jsonify<T>
  | ([NonJsonBranch<T>] extends [never] ? never : null);
type JsonifyList<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T extends readonly [infer First, ...infer Rest]
    ? [JsonifyArrayValue<First>, ...JsonifyList<Rest>]
    : Array<JsonifyArrayValue<T[number]>>;
type JsonifyObject<T extends object> = {
  [Key in keyof T as Key extends string | number
    ? [Jsonify<T[Key]>] extends [never]
      ? never
      : [NonJsonBranch<T[Key]>] extends [never]
        ? Key
        : never
    : never]-?: Jsonify<T[Key]>;
} & {
  [Key in keyof T as Key extends string | number
    ? [Jsonify<T[Key]>] extends [never]
      ? never
      : [NonJsonBranch<T[Key]>] extends [never]
        ? never
        : Key
    : never]?: Jsonify<T[Key]>;
};

export type Jsonify<T> =
  IsAny<T> extends true
    ? any
    : T extends { toJSON(): infer Json }
      ? Jsonify<Json>
      : T extends JsonPrimitive
        ? T
        : T extends String
          ? string
          : T extends Number
            ? number
            : T extends Boolean
              ? boolean
              : T extends
                    | Map<unknown, unknown>
                    | Set<unknown>
                    | Promise<unknown>
                ? { [key: string]: never }
                : T extends TypedArray
                  ? Record<string, number>
                  : T extends NotJson
                    ? never
                    : T extends readonly unknown[]
                      ? JsonifyList<T>
                      : T extends object
                        ? {
                            [Key in keyof JsonifyObject<T>]: JsonifyObject<T>[Key];
                          }
                        : unknown extends T
                          ? JsonValue
                          : never;

type DataFunctionResult<T> = T extends (...args: any[]) => infer Result
  ? Awaited<Result>
  : Awaited<T>;
type ReactRouterSerialize<T> = ReturnType<typeof useLoaderData<() => T>>;

type SerializeResult<T> =
  T extends TypedResponse<infer Data>
    ? Data
    : T extends TypedDeferredData<infer Data>
      ? ReactRouterSerialize<Data>
      : ReactRouterSerialize<T>;

export type SerializeFrom<T> = SerializeResult<DataFunctionResult<T>>;

export type TypedDeferredData<Data extends Record<string, unknown>> =
  ReturnType<typeof data<Data>> & {
    type: 'DataWithResponseInit';
    data: Data;
  };

export type JsonFunction = <Data>(
  value: Data,
  init?: number | ResponseInit
) => TypedResponse<Jsonify<Data>>;

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
  }) as TypedResponse<Jsonify<typeof value>>;
};

export const defer: DeferFunction = (value, init) =>
  data(value, init) as TypedDeferredData<typeof value>;
