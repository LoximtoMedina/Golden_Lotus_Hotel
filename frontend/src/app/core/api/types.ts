import { operations } from '../../../core/api/api.types';

export type ReqBody<T extends keyof operations> = operations[T] extends {
  requestBody: { content: { 'application/json': infer B } };
}
  ? B
  : never;

export type Res200<T extends keyof operations> = operations[T] extends {
  responses: { readonly 200: { content: { 'application/json': infer R } } };
}
  ? R
  : operations[T] extends { responses: { 200: { content: { 'application/json': infer R } } } }
    ? R
    : never;
