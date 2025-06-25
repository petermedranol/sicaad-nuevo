import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiUrl = environment.apiUrl;

  /**
   * Returns the full URL for a user's photo
   * @param userId The ID of the user
   * @param thumbnail Whether to get the thumbnail version
   * @returns The complete URL to the user's photo
   */
  getUserPhotoUrl(userId: number, thumbnail: boolean = false): string {
    return `${this.apiUrl}/api/images/user/${userId}${thumbnail ? '/true' : ''}`;
  }
}
