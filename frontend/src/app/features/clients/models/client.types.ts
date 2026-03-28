import { components } from '../../../../core/api/api.types';
import { ReqBody, Res200 } from '../../../core/api/types';

// ── Private helpers ───────────────────────────────────────────────────────────

// ── Schema ────────────────────────────────────────────────────────────────────

export type Client = components['schemas']['Client'];

// ── Namespaced API types ──────────────────────────────────────────────────────

export type CreateRequest = ReqBody<'createClient'>;
export type CreateResponse = Res200<'createClient'>;

export type GetRequest = ReqBody<'getClient'>;
export type GetResponse = Res200<'getClient'>;

export type ListRequest = ReqBody<'listClients'>;
export type ListResponse = Res200<'listClients'>;

export type UpdateRequest = ReqBody<'updateClient'>;
export type UpdateResponse = Res200<'updateClient'>;

export type DeleteRequest = ReqBody<'deleteClient'>;
export type DeleteResponse = Res200<'deleteClient'>;

export type RestoreRequest = ReqBody<'restoreClient'>;
export type RestoreResponse = Res200<'restoreClient'>;
