import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Camera, Upload, X, Save, RotateCcw, Mail } from 'lucide-angular';
import { ImageProcessorService } from '../../services/image-processor.service';
import { NotificationService } from '../../services/notification.service';
import { PhotoUploadDialogService } from '../../services/photo-upload-dialog.service';
import { environment } from '../../../../environments/environment';

export interface PhotoUploadConfig {
  entityType: 'user' | 'product' | 'employee' | 'category' | string;
  entityId: number;
  uploadEndpoint?: string; // Endpoint personalizado si es necesario
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  // ✅ Información adicional para mostrar
  entityName?: string; // Nombre del usuario/producto/etc
  entityEmail?: string; // Email del usuario (opcional)
  entityTitle?: string; // Título personalizado (opcional)
}

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- DaisyUI Modal -->
    <dialog
      #photoModal
      class="modal"
      [class.modal-open]="isVisible">

      <!-- Modal Backdrop -->
      <div class="modal-backdrop bg-black/50" (click)="close()"></div>

      <!-- Modal Content -->
      <div class="modal-box bg-gradient-to-br from-base-100 to-base-200 p-6 max-w-md w-full relative">
        <!-- Close button -->
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
          (click)="close()">
          <lucide-angular [name]="icons.X" size="18"></lucide-angular>
        </button>

      <!-- Header con información del usuario -->
      <div class="flex items-start justify-between mb-6 pr-8">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-base-content mb-1">{{ getTitle() }}</h3>
          <div class="text-sm text-base-content/70 space-y-1">
            <p class="flex items-center gap-2">
              <span class="badge badge-primary badge-sm">#{{ config?.entityId }}</span>
              <span *ngIf="config?.entityName" class="font-medium">{{ config?.entityName }}</span>
            </p>
            <p *ngIf="config?.entityEmail" class="flex items-center gap-2 text-xs">
              <lucide-angular [name]="icons.Mail" size="12" class="text-base-content/50"></lucide-angular>
              <span>{{ config?.entityEmail }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-5">

        <!-- Mode Toggle Switch - Diseño mejorado -->
        <div class="bg-base-200 rounded-lg p-3">
          <div class="flex items-center justify-center gap-4">
            <div class="flex items-center gap-2">
              <lucide-angular
                [name]="icons.Camera"
                size="18"
                [class.text-warning]="isCameraMode"
                [class.opacity-50]="!isCameraMode">
              </lucide-angular>
              <span class="text-sm font-medium"
                    [class.text-warning]="isCameraMode"
                    [class.opacity-50]="!isCameraMode">
                Cámara
              </span>
            </div>

            <input
              type="checkbox"
              class="toggle toggle-md"
              [class.toggle-warning]="isCameraMode"
              [class.toggle-success]="!isCameraMode"
              [checked]="!isCameraMode"
              (change)="toggleMode()"
              [disabled]="isProcessing || hasPhoto">

            <div class="flex items-center gap-2">
              <lucide-angular
                [name]="icons.Upload"
                size="18"
                [class.text-success]="!isCameraMode"
                [class.opacity-50]="isCameraMode">
              </lucide-angular>
              <span class="text-sm font-medium"
                    [class.text-success]="!isCameraMode"
                    [class.opacity-50]="isCameraMode">
                Archivo
              </span>
            </div>
          </div>
        </div>

        <!-- Camera Mode -->
        <div *ngIf="isCameraMode && !hasPhoto" class="space-y-4">
          <div class="text-center">
            <p class="text-sm text-base-content/70 mb-3">Captura la foto usando la cámara</p>
          </div>

          <!-- Camera Video Container - Diseño mejorado -->
          <div class="relative bg-base-300 rounded-xl overflow-hidden w-64 h-64 mx-auto border-2 border-base-300 shadow-inner">
            <video
              #videoElement
              *ngIf="cameraActive"
              class="w-full h-full object-cover"
              autoplay
              muted
              playsinline>
            </video>

            <!-- Mensaje cuando no hay cámara activa -->
            <div *ngIf="!cameraActive" class="absolute inset-0 flex items-center justify-center text-base-content/60">
              <div class="text-center">
                <div class="bg-base-200 rounded-full p-4 mb-3 mx-auto w-fit">
                  <lucide-angular [name]="icons.Camera" size="32" class="text-base-content/40"></lucide-angular>
                </div>
                <p class="text-sm font-medium">Presiona para activar la cámara</p>
              </div>
            </div>

            <!-- Loading overlay -->
            <div *ngIf="isProcessing" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div class="text-center text-white">
                <div class="loading loading-spinner loading-lg text-white"></div>
                <p class="text-sm mt-3 font-medium">Procesando imagen...</p>
              </div>
            </div>

            <!-- Botón redondo dentro del frame -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <button
                *ngIf="!cameraActive"
                type="button"
                class="btn btn-warning btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                (click)="startCamera()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Camera" size="24"></lucide-angular>
              </button>

              <button
                *ngIf="cameraActive"
                type="button"
                class="btn btn-warning btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-200 animate-pulse"
                (click)="captureFromCamera()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Camera" size="24"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

        <!-- Upload Mode -->
        <div *ngIf="!isCameraMode && !hasPhoto" class="space-y-4">
          <div class="text-center">
            <p class="text-sm text-base-content/70 mb-3">Selecciona una imagen desde tu dispositivo</p>
          </div>

          <!-- Upload Container - Diseño mejorado -->
          <div class="relative bg-base-300 rounded-xl overflow-hidden w-64 h-64 mx-auto border-2 border-dashed border-base-400 hover:border-success transition-colors duration-200">
            <!-- Icono no-image-photo centrado -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center text-base-content/60">
                <div class="bg-base-200 rounded-full p-4 mb-3 mx-auto w-fit">
                  <lucide-angular [name]="icons.Upload" size="32" class="text-base-content/40"></lucide-angular>
                </div>
                <p class="text-sm font-medium">Haz clic para seleccionar archivo</p>
                <p class="text-xs text-base-content/50 mt-1">JPG, PNG, GIF hasta 10MB</p>
              </div>
            </div>

            <!-- Loading overlay -->
            <div *ngIf="isProcessing" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div class="text-center text-white">
                <div class="loading loading-spinner loading-lg text-white"></div>
                <p class="text-sm mt-3 font-medium">Procesando imagen...</p>
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
                class="btn btn-success btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                (click)="fileInput.click()"
                [disabled]="isProcessing">
                <lucide-angular [name]="icons.Upload" size="24"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

        <!-- Photo Preview -->
        <div *ngIf="hasPhoto" class="space-y-4">
          <div class="text-center">
            <p class="text-sm text-success font-medium mb-3">✓ Imagen capturada correctamente</p>
          </div>

          <!-- Preview Container - Diseño mejorado -->
          <div class="relative bg-success/10 rounded-xl overflow-hidden w-64 h-64 mx-auto border-2 border-success shadow-lg">
            <img
              [src]="photoPreview"
              alt="Preview"
              class="w-full h-full object-cover"
              (load)="onImageLoad()"
              (error)="onImageError()">

            <!-- Loading overlay -->
            <div *ngIf="isProcessing" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div class="text-center text-white">
                <div class="loading loading-spinner loading-lg text-white"></div>
                <p class="text-sm mt-3 font-medium">Guardando imagen...</p>
              </div>
            </div>

            <!-- Botones dentro del frame -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <button
                type="button"
                class="btn btn-ghost bg-base-300 hover:bg-base-400 border-base-400 btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                (click)="retakePhoto()"
                [disabled]="isProcessing"
                title="Descartar y tomar nueva foto">
                <lucide-angular [name]="icons.X" size="24" class="text-base-content/70"></lucide-angular>
              </button>

              <button
                type="button"
                class="btn btn-success btn-circle btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                (click)="savePhoto()"
                [disabled]="isProcessing"
                title="Guardar imagen">
                <lucide-angular [name]="icons.Save" size="24"></lucide-angular>
              </button>
            </div>
          </div>
        </div>

      </div>

      </div> <!-- Cerrar modal-box -->
    </dialog>
  `,
  styles: [`
    .photo-upload-container {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateX(20px) scale(0.95);
      overflow: hidden;
      max-height: 0;
      backdrop-filter: blur(10px);
    }

    .photo-upload-container.show {
      opacity: 1;
      transform: translateX(0) scale(1);
      max-height: 800px;
    }

    .photo-upload-container.hide {
      opacity: 0;
      transform: translateX(20px) scale(0.95);
      max-height: 0;
    }

    /* Animaciones suaves para botones */
    .btn-circle {
      transition: all 0.2s ease-in-out;
    }

    .btn-circle:hover {
      transform: scale(1.05);
    }

    .btn-circle:active {
      transform: scale(0.95);
    }

    /* Efecto de pulso para botón de captura */
    @keyframes capture-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .animate-pulse {
      animation: capture-pulse 2s infinite;
    }

    /* Estilo para el toggle */
    .toggle {
      transition: all 0.3s ease;
    }

    /* Mejoras para badges */
    .badge-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      font-weight: 600;
    }
  `]
})
export class PhotoUploadComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isVisible = false;
  @Input() config?: PhotoUploadConfig;

  @Output() photoUploaded = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  // Services
  private readonly imageProcessor = inject(ImageProcessorService);
  private readonly notification = inject(NotificationService);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogService = inject(PhotoUploadDialogService);

  // Icons
  protected readonly icons = { Camera, Upload, X, Save, RotateCcw, Mail };

  // State
  cameraActive = false;
  hasPhoto = false;
  photoPreview = '';
  isProcessing = false;
  isReady = false;
  isClosing = false;
  isCameraMode = true; // Por defecto en modo cámara

  private videoStream: MediaStream | null = null;

  // ✅ Memory leak prevention - solo lo básico
  private timeoutIds: number[] = [];
  private documentClickListener?: (event: Event) => void;

  ngOnInit(): void {
    // Escuchar cuando el service quiere mostrar el dialog
    this.dialogService.showDialog.subscribe((config) => {
      this.config = config;
      this.isVisible = true;
      this.resetState();
      this.show();
    });

    // Escuchar cuando el service quiere cerrar el dialog
    this.dialogService.hideDialog.subscribe(() => {
      this.close();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

    // ✅ Reset component when config changes (different user/entity)
    if (changes['config'] && changes['config'].currentValue && changes['config'].previousValue) {
      const currentConfig = changes['config'].currentValue;
      const previousConfig = changes['config'].previousValue;

      // Reset if entityId or entityType changed
      if (currentConfig.entityId !== previousConfig.entityId ||
          currentConfig.entityType !== previousConfig.entityType) {
        this.resetState();
      }
    }

    if (changes['isVisible'] && changes['isVisible'].currentValue && !changes['isVisible'].previousValue) {

      // ✅ ALWAYS reset when component becomes visible (even for same user)
      this.resetState();

      // ✅ Add delay to ensure camera is fully closed before showing
      this.addSafeTimeout(() => {
        // Component is becoming visible, trigger show animation
        this.show();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // ✅ Limpiar timeouts
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];

    // ✅ Limpiar cámara
    this.stopCamera();

    // ✅ Limpiar listeners del documento
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = undefined;
    }

    // Clean up object URL if it exists
    if (this.photoPreview && this.photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview);
    }
  }

  // ✅ Método seguro para timeouts
  private addSafeTimeout(callback: () => void, delay: number): void {
    const timeoutId = window.setTimeout(() => {
      callback();
      // Remover del array una vez ejecutado
      this.timeoutIds = this.timeoutIds.filter(id => id !== timeoutId);
    }, delay);
    this.timeoutIds.push(timeoutId);
  }

  getTitle(): string {
    const entityNames: Record<string, string> = {
      user: 'Foto de Usuario',
      product: 'Foto de Producto',
      employee: 'Foto de Empleado',
      category: 'Foto de Categoría'
    };
    return entityNames[this.config?.entityType || ''] || 'Subir Foto';
  }

  public async startCamera(): Promise<void> {

    // ✅ Cancel any pending timeouts that might interfere
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];

    // Always stop any existing camera first
    this.stopCamera();

    if (!this.cameraActive) {
      try {
        this.videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        // Set camera active first to render the video element
        this.cameraActive = true;

        // Force change detection to render video element
        this.cdr.detectChanges();

        // Wait for the video element to be rendered in DOM
        this.addSafeTimeout(() => {
          const video = this.videoElement?.nativeElement || document.querySelector('video');

          if (video && this.videoStream) {
            video.srcObject = this.videoStream;
          } else {
            // Try again with a longer delay
            this.addSafeTimeout(() => {
              const retryVideo = document.querySelector('video');
              if (retryVideo && this.videoStream) {
                retryVideo.srcObject = this.videoStream;
              }
            }, 300);
          }
        }, 100);

      } catch (error) {
        this.cameraActive = false;
        await this.notification.showError('Error', 'No se pudo acceder a la cámara. Asegúrate de dar permisos de cámara al navegador.');
      }
    } else {
      // Capture photo
      await this.captureFromCamera();
    }
  }

  public async captureFromCamera(): Promise<void> {
    const video = this.videoElement?.nativeElement || document.querySelector('video');

    if (!video) {
      return;
    }


    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);

      // Generate base64 directly - simpler and more reliable
      const base64Data = canvas.toDataURL('image/jpeg', this.config?.quality || 0.8);

      // Stop camera after successful capture
      this.stopCamera();

      // Process the base64 data directly
      await this.processPhotoBase64(base64Data);

      this.stopCamera();
    } else {
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
    this.isProcessing = true;

    try {
      // imageProcessor.resizeImage always returns base64 string
      const processedImage = await this.imageProcessor.resizeImage(
        base64Data,
        this.config?.maxWidth || 800,
        this.config?.maxHeight || 800
      );


      // Keep base64 for preview and upload - much simpler!
      this.photoPreview = processedImage;
      this.hasPhoto = true;

      // Force change detection
      this.cdr.detectChanges();


      // Force change detection
      setTimeout(() => {
      }, 0);

    } catch (error) {
      await this.notification.showError('Error', 'Error al procesar la imagen');
    } finally {
      this.isProcessing = false;
    }
  }

  private async processPhoto(imageData: string | File): Promise<void> {
    this.isProcessing = true;

    try {
      // imageProcessor.resizeImage always returns base64 string
      const processedImage = await this.imageProcessor.resizeImage(
        imageData,
        this.config?.maxWidth || 800,
        this.config?.maxHeight || 800
      );


      // Keep base64 for preview and upload - much simpler!
      this.photoPreview = processedImage;
      this.hasPhoto = true;

      // Force change detection
      this.cdr.detectChanges();


      // Force change detection
      setTimeout(() => {
      }, 0);

    } catch (error) {
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
      this.addSafeTimeout(() => {
        this.startCamera();
      }, 100);
    }
  }  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  close(): void {

    // ✅ 1. CANCELAR TODOS LOS TIMEOUTS INMEDIATAMENTE
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];

    // ✅ 2. Stop camera IMMEDIATELY when closing
    this.stopCamera();

    // ✅ 3. Hide modal immediately
    this.isVisible = false;
    this.isClosing = true;

    // ✅ 4. Reset state immediately (no timeout needed)
    this.resetState();
    this.closed.emit();
  }

  private stopCamera(): void {

    // ✅ 1. Set camera inactive immediately
    this.cameraActive = false;

    // ✅ 2. Stop video stream tracks immediately
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => {
        track.stop();
      });
      this.videoStream = null;
    }

    // ✅ 3. Clear video element srcObject immediately
    const video = this.videoElement?.nativeElement || document.querySelector('video');
    if (video) {
      video.srcObject = null;
      video.load(); // Force reload to clear any cached frame
    }

    // ✅ 4. Force change detection to update UI immediately
    this.cdr.detectChanges();

  }

  private resetState(): void {

    // ✅ 1. Cancel all pending timeouts first
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];

    // ✅ 2. Ensure camera is stopped (should already be stopped by close())
    if (this.cameraActive || this.videoStream) {
      this.stopCamera();
    }

    // ✅ 3. Reset photo state
    this.hasPhoto = false;

    // ✅ 4. Clean up object URL if it exists
    if (this.photoPreview && this.photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview);
    }

    // ✅ 5. Reset all state variables
    this.photoPreview = '';
    this.isProcessing = false;
    this.isReady = false;
    this.isClosing = false;
    this.isCameraMode = true; // Reset to camera mode

    // ✅ 6. Force change detection immediately
    this.cdr.detectChanges();

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
      this.addSafeTimeout(() => {
        this.startCamera();
      }, 100);
    }
  }  // Method to show the component with animation
  public show(): void {
    this.isReady = false;

    // Small delay to allow Angular to render before applying animation
    this.addSafeTimeout(() => {
      this.isReady = true;

      // Auto-start camera if in camera mode
      if (this.isCameraMode) {
        this.addSafeTimeout(() => {
          this.startCamera();
        }, 200);
      }
    }, 50);
  }

  // Debug methods for image preview
  onImageLoad(): void {
  }

  onImageError(): void {
  }
}
