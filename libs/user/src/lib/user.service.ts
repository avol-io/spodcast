import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {
    //
  }

  getUserProfile() {
    return this.http.get('https://api.spotify.com/v1/me');
  }
}
