import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { World, Pallier, Product } from './world';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private _server = 'http://localhost:8080/adventureISIS/';
  private _user = '';
  constructor(private http: HttpClient) { }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  getWorld(): Promise<World> {
    return this.http.get(this._server + 'webresources/generic/world')
      .toPromise().catch(this.handleError);
  }

  get server(): string {
    return this._server;
  }

  get user(): string {
    return this._user;
  }

  // tslint:disable-next-line:adjacent-overload-signatures
  set server(value: string) {
    this._server = value;
  }

  // tslint:disable-next-line:adjacent-overload-signatures
  set user(value: string) {
    this._user = value;
  }
}
