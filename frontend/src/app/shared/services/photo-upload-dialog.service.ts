import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PhotoUploadConfig } from '../components/photo-upload/photo-upload.component';

@Injectable({
  providedIn: 'root'
})
export class PhotoUploadDialogService {
  private showDialog$ = new Subject<PhotoUploadConfig>();
  private hideDialog$ = new Subject<void>();

  // Observables para que el componente escuche
  public showDialog = this.showDialog$.asObservable();
  public hideDialog = this.hideDialog$.asObservable();

  /**
   * Abrir el dialog de photo upload
   */
  public open(config: PhotoUploadConfig): void {
    this.showDialog$.next(config);
  }

  /**
   * Cerrar el dialog
   */
  public close(): void {
    this.hideDialog$.next();
  }
}
