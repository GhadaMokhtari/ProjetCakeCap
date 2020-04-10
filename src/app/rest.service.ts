import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { World, Pallier, Product } from './world';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  // tslint:disable-next-line:variable-name
   _server = 'http://localhost:8080/adventureisis';
  // tslint:disable-next-line:variable-name
   user = localStorage.getItem('username');

  constructor(private http: HttpClient) { }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  private setHeaders(user: string): HttpHeaders {
    console.log(user);
    const headers = new HttpHeaders({ 'X-User': user});

    console.log(headers);
    return headers;
  }

  getWorld(): Promise<World> {
    return this.http.get(this._server + '/generic/world', {
      headers: this.setHeaders(this.user)
    })
      .toPromise()
      .catch(this.handleError);
  }

  getServer(): string {
    return this._server;
  }

  getUser(): string {
    return this.user;
  }

  // tslint:disable-next-line:adjacent-overload-signatures
  setServer(value: string) {
    this._server = value;
  }
  // tslint:disable-next-line:adjacent-overload-signatures
  setUser(value: string) {
    this.user = value;
  }

  public putManager(manager: Pallier): Promise<Response> {
    // console.log(upgrade);
    return this.http
      .put(this._server + 'generic/manager', manager, {
        headers: { 'X-user': this.getUser() }
      })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }


  public putProduct(product: Product): Promise<Response> {
    // console.log(product);
    return this.http
      .put(this._server + 'generic/product', product, {
        headers: { 'X-user': this.getUser() }
      })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  public putUpgrade(upgrade: Pallier): Promise<Response> {
    // console.log(upgrade);
    return this.http
      .put(this._server + 'generic/upgrade', upgrade, {
        headers: { 'X-user': this.getUser() }
      })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  public putAngel(angel: Pallier): Promise<Response> {
    // console.log(angel);
    return this.http
      .put(this._server + 'generic/angelupgrade', angel, {
        headers: { 'X-user': this.getUser() }
      })
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  // public saveWorld(world: World) {
  //   this.http
  //     .put(this._server + 'generic/world', world, {
  //       headers: {'X-user': localStorage.getItem('username')}
  //     })
  //     .subscribe(
  //       () => {
  //         console.log('Enregistrement effectué');
  //       },
  //       (error) => {
  //         console.log('Erreur : ' + error);
  //       }
  //     );
  //
  // }

  public deleteWorld(): Promise<Response> {
    return this.http
      .delete(this._server + 'generic/world', {
        headers: this.setHeaders(this.getUser())
      })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }
}
