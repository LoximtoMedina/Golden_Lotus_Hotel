// src/app/features/client/services/client.service.ts
import { Injectable } from '@angular/core';
import { BaseApiService } from '../../../core/services/base-api.service';
import {
  CreateRequest,
  CreateResponse,
  GetRequest,
  GetResponse,
  UpdateRequest,
  UpdateResponse,
  DeleteRequest,
  DeleteResponse,
  ListRequest,
  ListResponse,
} from '../models/client.types';

@Injectable({ providedIn: 'root' })
export class ClientService extends BaseApiService {
  protected readonly resource = 'clients';

  create(data: CreateRequest) {
    return this.post<CreateResponse, CreateResponse>('create', data);
  }

  get(data: GetRequest) {
    return this.post<GetResponse, GetRequest>('get', data);
  }

  update(data: UpdateRequest) {
    return this.post<UpdateRequest, UpdateResponse>('update', data);
  }

  delete(data: DeleteRequest) {
    return this.post<DeleteResponse, DeleteRequest>('delete', data);
  }

  list(data: ListRequest) {
    return this.post<ListResponse, ListRequest>('list', data);
  }
}
