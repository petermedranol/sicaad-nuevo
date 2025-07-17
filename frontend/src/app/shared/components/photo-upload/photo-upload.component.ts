import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Camera, Upload, X, Save, RotateCcw } from 'lucide-angular';
import { ImageProcessorService } from '../../services/image-processor.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../../environments/environment';

export interface PhotoUploadConfig {
  entityType: 'user' | 'product' | 'employee' | 'category' | string;
  entityId: number;
  uploadEndpoint?: string; // Endpoint personalizado si es necesario
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Inline Photo Upload Container -->
    <div
      *ngIf="isVisible"
      class="bg-base-200/50 rounded-lg p-4 border-l-4 border-base-400 photo-upload-container"
      [class.show]="isReady"
      [class.hide]="isClosing">

      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-base-content">{{ getTitle() }}</h3>
        <button
          class="btn btn-ghost btn-sm btn-square"
          (click)="close()">
          <lucide-angular [name]="icons.X" size="16"></lucide-angular>
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-4">

        <!-- Mode Toggle Switch - Siempre visible -->
        <div class="flex items-center justify-center gap-3">
          <div class="flex items-center gap-2">
            <lucide-angular 
              [name]="icons.Camera" 
              size="20"
              [class.text-orange-500]="isCameraMode"
              [class.text-base-content]="!isCameraMode"
              [class.opacity-50]="!isCameraMode">
            </lucide-angular>
            <span class="text-sm" 
                  [class.text-orange-500]="isCameraMode" 
                  [class.text-base-content]="!isCameraMode"
                  [class.opacity-50]="!isCameraMode">
              Cámara
            </span>
          </div>
          
          <input 
            type="checkbox" 
            class="toggle toggle-lg" 
            [class.toggle-warning]="isCameraMode"
            [class.toggle-success]="!isCameraMode"
            [checked]="!isCameraMode"
            (change)="toggleMode()"
            [disabled]="isProcessing || hasPhoto">
          
          <div class="flex items-center gap-2">
            <lucide-angular 
              [name]="icons.Upload" 
              size="20"
              [class.text-teal-500]="!isCameraMode"
              [class.text-base-content]="isCameraMode"
              [class.opacity-50]="isCameraMode">
            </lucide-angular>
            <span class="text-sm" 
                  [class.text-teal-500]="!isCameraMode" 
                  [class.text-base-content]="isCameraMode"
                  [class.opacity-50]="isCameraMode">
              Archivo
            </span>
          </div>
        </div>

        <!-- Camera Mode -->
        <div *ngIf="isCameraMode && !hasPhoto" class="space-y-3">
          <!-- Camera Video Container - Cuadrado con botón dentro -->
          <div class="relative bg-base-300 rounded-lg overflow-hidden w-64 h-64 mx-auto">
            <video
              #videoElement
              *ngIf="cameraActive"
              class="w-full h-full object-cover"
              autoplay
              muted
              playsinline>
            </video>
            <!-- Mensaje cuando no hay cámara activa -->
            <div *ngIf="!cameraActive" class="absolute inset-0 flex items-center justify-center text-base-content opacity-50">
              <div class="text-center">
                <lucide-angular [name]="icons.Camera" size="48" class="mx-auto mb-2"></lucide-angular>
                <p>Cámara</p>
              </div>
            </div>
            
            <!-- Loading overlay -->
            <div *ngIf="isProcessing" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div class="text-center text-white">
                <div class="loading loading-spinner loading-md"></div>
                <p class="text-sm mt-2">Procesando...</p>
              </div>
            </div>
            
            <!-- Botón redondo dentro del frame -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                *ngIf="!cameraActive"
                type="button"
                class="btn btn-warning btn-circle btn-lg"
                (click)="startCamera()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Camera" size="24"></lucide-angular>
              </button>
              
              <button
                *ngIf="cameraActive"
                type="button"
                class="btn btn-warning btn-circle btn-lg"
                (click)="captureFromCamera()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Camera" size="24"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Mode -->
        <div *ngIf="!isCameraMode && !hasPhoto" class="space-y-3">
          <!-- Upload Container - Cuadrado con botón dentro -->
          <div class="relative bg-base-300 rounded-lg overflow-hidden w-64 h-64 mx-auto">
            <!-- Icono no-image-photo centrado -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center text-base-content">
                <img src="/no-image-photo.png" alt="Sin imagen" class="w-16 h-16 mx-auto mb-2 opacity-50">
                <p>Archivo</p>
              </div>
            </div>
            
            <!-- Loading overlay -->
            <div *ngIf="isProcessing" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div class="text-center text-white">
                <div class="loading loading-spinner loading-md"></div>
                <p class="text-sm mt-2">Procesando...</p>
              </div>
            </div>
            
            <!-- Botón redondo dentro del frame -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <input
                #fileInput
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onFileSelected($event)">
              <button
                type="button"
                class="btn btn-success btn-circle btn-lg"
                (click)="fileInput.click()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Upload" size="24"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

        <!-- Photo Preview -->
        <div *ngIf="hasPhoto" class="space-y-3">
          <!-- Preview Container - Cuadrado con botones dentro -->
          <div class="relative bg-base-300 rounded-lg overflow-hidden w-64 h-64 mx-auto">
            <img
              [src]="photoPreview"
              alt="Preview"
              class="w-full h-full object-cover"
              (load)="onImageLoad()"
              (error)="onImageError()">
            
            <!-- Loading overlay -->
            <div *ngIf="isProcessing" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div class="text-center text-white">
                <div class="loading loading-spinner loading-md"></div>
                <p class="text-sm mt-2">Guardando...</p>
              </div>
            </div>
            
            <!-- Botones dentro del frame -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                type="button"
                class="btn btn-error btn-circle btn-lg"
                (click)="retakePhoto()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.X" size="24"></lucide-angular>
              </button>
              
              <button
                type="button"
                class="btn btn-success btn-circle btn-lg"
                (click)="savePhoto()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Save" size="24"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

        <!-- Processing Indicator -->
        <!-- Removido - ahora está integrado en cada frame -->

      </div>

    </div>
  `,
  styles: [`
    .photo-upload-container {
      transition: all 0.3s ease-in-out;
      opacity: 0;
      transform: translateY(-10px);
      overflow: hidden;
      max-height: 0;
    }

    .photo-upload-container.show {
      opacity: 1;
      transform: translateY(0);
      max-height: 1000px;
    }

    .photo-upload-container.hide {
      opacity: 0;
      transform: translateY(-10px);
      max-height: 0;
    }
  `]
})
export class PhotoUploadComponent implements OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Input() config!: PhotoUploadConfig;

  @Output() photoUploaded = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  // Services
  private readonly imageProcessor = inject(ImageProcessorService);
  private readonly notification = inject(NotificationService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  // Icons
  protected readonly icons = { Camera, Upload, X, Save, RotateCcw };

  // State
  cameraActive = false;
  hasPhoto = false;
  photoPreview = '';
  isProcessing = false;
  isReady = false;
  isClosing = false;
  isCameraMode = true; // Por defecto en modo cámara

  private videoStream: MediaStream | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    console.log('PhotoUpload ngOnChanges:', changes);
    if (changes['isVisible'] && changes['isVisible'].currentValue && !changes['isVisible'].previousValue) {
      console.log('Component becoming visible, triggering show animation');
      // Component is becoming visible, trigger show animation
      this.show();
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();

    // Clean up object URL if it exists
    if (this.photoPreview && this.photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview);
    }
  }

  getTitle(): string {
    const entityNames: Record<string, string> = {
      user: 'Foto de Usuario',
      product: 'Foto de Producto',
      employee: 'Foto de Empleado',
      category: 'Foto de Categoría'
    };
    return entityNames[this.config?.entityType] || 'Subir Foto';
  }

  public async startCamera(): Promise<void> {
    console.log('startCamera called, cameraActive:', this.cameraActive);

    if (!this.cameraActive) {
      try {
        console.log('Requesting camera access...');
        this.videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        console.log('Camera access granted, setting cameraActive to true');
        // Set camera active first to render the video element
        this.cameraActive = true;

        // Wait for the video element to be rendered in DOM
        setTimeout(() => {
          const video = this.videoElement?.nativeElement || document.querySelector('video');
          console.log('Looking for video element:', video);

          if (video && this.videoStream) {
            video.srcObject = this.videoStream;
            console.log('Video stream assigned successfully');
          } else {
            console.error('Video element not found, trying fallback...');
            // Try again with a longer delay
            setTimeout(() => {
              const retryVideo = document.querySelector('video');
              console.log('Retry - Found video element:', retryVideo);
              if (retryVideo && this.videoStream) {
                retryVideo.srcObject = this.videoStream;
                console.log('Video stream assigned on retry');
              }
            }, 300);
          }
        }, 100);

      } catch (error) {
        console.error('Error accessing camera:', error);
        this.cameraActive = false;
        await this.notification.showError('Error', 'No se pudo acceder a la cámara. Asegúrate de dar permisos de cámara al navegador.');
      }
    } else {
      // Capture photo
      console.log('Camera is active, capturing photo...');
      await this.captureFromCamera();
    }
  }

  public async captureFromCamera(): Promise<void> {
    console.log('captureFromCamera called');
    const video = this.videoElement?.nativeElement || document.querySelector('video');
    console.log('Found video element for capture:', video);

    if (!video) {
      console.error('No video element found for capture');
      return;
    }

    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      console.log('Drawing video to canvas...');
      ctx.drawImage(video, 0, 0);

      // Generate base64 directly - simpler and more reliable
      const base64Data = canvas.toDataURL('image/jpeg', this.config?.quality || 0.8);
      console.log('Canvas.toDataURL generated base64, length:', base64Data.length);
      
      // Stop camera after successful capture
      this.stopCamera();
      
      // Process the base64 data directly
      await this.processPhotoBase64(base64Data);

      this.stopCamera();
    } else {
      console.error('Failed to get canvas context');
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      await this.processPhoto(file);
    }
  }

  private async processPhotoBase64(base64Data: string): Promise<void> {
    console.log('processPhotoBase64 called with base64 length:', base64Data.length);
    this.isProcessing = true;

    try {
      // imageProcessor.resizeImage always returns base64 string
      console.log('Calling imageProcessor.resizeImage...');
      const processedImage = await this.imageProcessor.resizeImage(
        base64Data,
        this.config?.maxWidth || 800,
        this.config?.maxHeight || 800
      );

      console.log('processedImage received:', processedImage?.substring(0, 50) + '...');

      // Keep base64 for preview and upload - much simpler!
      this.photoPreview = processedImage;
      this.hasPhoto = true;

      // Force change detection
      this.cdr.detectChanges();

      console.log('processPhotoBase64 completed - hasPhoto:', this.hasPhoto, 'photoPreview length:', this.photoPreview.length);

      // Force change detection
      setTimeout(() => {
        console.log('After timeout - hasPhoto:', this.hasPhoto, 'cameraActive:', this.cameraActive);
        console.log('Template conditions check:');
        console.log('  - Upload controls (*ngIf="!hasPhoto"):', !this.hasPhoto);
        console.log('  - Camera view (*ngIf="cameraActive && !hasPhoto"):', this.cameraActive && !this.hasPhoto);
        console.log('  - Photo preview (*ngIf="hasPhoto"):', this.hasPhoto);
        console.log('  - photoPreview value exists:', !!this.photoPreview);
        console.log('  - photoPreview starts with data:', this.photoPreview?.startsWith('data:'));
      }, 0);

    } catch (error) {
      console.error('Error processing image:', error);
      await this.notification.showError('Error', 'Error al procesar la imagen');
    } finally {
      this.isProcessing = false;
    }
  }

  private async processPhoto(imageData: string | File): Promise<void> {
    console.log('processPhoto called with:', imageData);
    this.isProcessing = true;

    try {
      // imageProcessor.resizeImage always returns base64 string
      console.log('Calling imageProcessor.resizeImage...');
      const processedImage = await this.imageProcessor.resizeImage(
        imageData,
        this.config?.maxWidth || 800,
        this.config?.maxHeight || 800
      );

      console.log('processedImage received:', processedImage?.substring(0, 50) + '...');

      // Keep base64 for preview and upload - much simpler!
      this.photoPreview = processedImage;
      this.hasPhoto = true;

      // Force change detection
      this.cdr.detectChanges();

      console.log('processPhoto completed - hasPhoto:', this.hasPhoto, 'photoPreview length:', this.photoPreview.length);

      // Force change detection
      setTimeout(() => {
        console.log('After timeout - hasPhoto:', this.hasPhoto, 'cameraActive:', this.cameraActive);
        console.log('Template conditions check:');
        console.log('  - Upload controls (*ngIf="!hasPhoto"):', !this.hasPhoto);
        console.log('  - Camera view (*ngIf="cameraActive && !hasPhoto"):', this.cameraActive && !this.hasPhoto);
        console.log('  - Photo preview (*ngIf="hasPhoto"):', this.hasPhoto);
        console.log('  - photoPreview value exists:', !!this.photoPreview);
        console.log('  - photoPreview starts with data:', this.photoPreview?.startsWith('data:'));
      }, 0);

    } catch (error) {
      console.error('Error processing image:', error);
      await this.notification.showError('Error', 'Error al procesar la imagen');
    } finally {
      this.isProcessing = false;
    }
  }

  async savePhoto(): Promise<void> {
    if (!this.photoPreview || !this.config) return;

    this.isProcessing = true;

    try {
      // Construct endpoint based on entity type
      let endpoint: string;

      if (this.config.uploadEndpoint) {
        endpoint = this.config.uploadEndpoint;
      } else {
        // Default endpoints for each entity type
        switch (this.config.entityType) {
          case 'user':
            endpoint = `${environment.apiUrl}/api/users/${this.config.entityId}/photo`;
            break;
          case 'product':
            endpoint = `${environment.apiUrl}/api/products/${this.config.entityId}/photo`;
            break;
          case 'employee':
            endpoint = `${environment.apiUrl}/api/employees/${this.config.entityId}/photo`;
            break;
          case 'category':
            endpoint = `${environment.apiUrl}/api/categories/${this.config.entityId}/photo`;
            break;
          default:
            endpoint = `${environment.apiUrl}/api/${this.config.entityType}s/${this.config.entityId}/photo`;
        }
      }

      // Use base64 upload - simpler and more reliable
      const requestData = {
        photo: this.photoPreview,
        entity_type: this.config.entityType,
        entity_id: this.config.entityId
      };
      
      const headers = {
        'Content-Type': 'application/json'
      };

      console.log('Using base64 upload as JSON');
      console.log('- photo (base64 length):', this.photoPreview.length);
      console.log('- entity_type:', this.config.entityType);
      console.log('- entity_id:', this.config.entityId);

      console.log('Uploading to endpoint:', endpoint);

      const uploadResponse = await this.http.patch<any>(endpoint, requestData, {
        withCredentials: true,  // Include cookies for Sanctum authentication
        headers: headers,
        observe: 'body'
      }).toPromise();

      if (uploadResponse?.success) {
        this.photoUploaded.emit(uploadResponse.photo_url || this.photoPreview);
        
        // Cerrar componente inmediatamente en paralelo
        this.close();
        
        // Mostrar toast de éxito (no bloqueante)
        this.notification.showSuccess('Foto guardada con éxito');
      } else {
        throw new Error(uploadResponse?.message || 'Error al guardar la foto');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      console.error('Error response:', error.error);

      let errorMessage = 'Error al guardar la foto';

      if (error.status === 419) {
        errorMessage = 'Sesión expirada. Por favor, recarga la página e intenta de nuevo.';
      } else if (error.status === 401) {
        errorMessage = 'No tienes autorización para realizar esta acción.';
      } else if (error.status === 422) {
        errorMessage = 'Los datos de la imagen no son válidos.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      // Mostrar toast de error (no bloqueante)
      this.notification.showError('Error', errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  // Method to reset the state when taking a new photo
  retakePhoto(): void {
    this.hasPhoto = false;
    this.photoPreview = '';

    // Clean up object URL if it exists
    if (this.photoPreview && this.photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview);
    }
    
    // Auto-start camera if in camera mode
    if (this.isCameraMode) {
      setTimeout(() => {
        this.startCamera();
      }, 100);
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {
    this.isClosing = true;

    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.stopCamera();
      this.resetState();
      this.closed.emit();
    }, 300);
  }

  private stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.cameraActive = false;
  }

  private resetState(): void {
    this.hasPhoto = false;

    // Clean up object URL if it exists
    if (this.photoPreview && this.photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview);
    }

    this.photoPreview = '';
    this.isProcessing = false;
    this.isReady = false;
    this.isClosing = false;
    this.stopCamera();
  }

  // Method to toggle between camera and upload modes
  toggleMode(): void {
    this.isCameraMode = !this.isCameraMode;
    
    // Stop camera if switching to upload mode
    if (!this.isCameraMode) {
      this.stopCamera();
    }
    // Auto-start camera if switching to camera mode
    else {
      setTimeout(() => {
        this.startCamera();
      }, 100);
    }
  }

  // Method to show the component with animation
  public show(): void {
    console.log('PhotoUpload show() called');
    this.isReady = false;

    // Small delay to allow Angular to render before applying animation
    setTimeout(() => {
      console.log('Setting isReady to true');
      this.isReady = true;
      
      // Auto-start camera if in camera mode
      if (this.isCameraMode) {
        setTimeout(() => {
          this.startCamera();
        }, 200);
      }
    }, 50);
  }

  // Debug methods for image preview
  onImageLoad(): void {
    console.log('✅ Image preview loaded successfully');
  }

  onImageError(): void {
    console.log('❌ Error loading image preview');
  }
}
