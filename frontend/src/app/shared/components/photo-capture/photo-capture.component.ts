import { Component, ElementRef, ViewChild, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebcamService } from '../../services/webcam.service';
import { ImageProcessorService } from '../../services/image-processor.service';

@Component({
  selector: 'app-photo-capture',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Vista previa de la webcam -->
      <div class="relative w-full max-w-[350px] mx-auto">
        <video
          #videoElement
          [class.hidden]="!showVideo()"
          autoplay
          playsinline
          class="w-full h-auto rounded-lg shadow-lg"></video>
        
        @if (previewImage()) {
          <img
            [src]="previewImage()"
            class="w-full h-auto rounded-lg shadow-lg"
            alt="Vista previa de la foto"
          />
        }
      </div>

      <!-- Controles -->
      <div class="flex justify-center gap-4">
        @if (!previewImage()) {
          <button
            class="btn btn-primary"
            [disabled]="!isWebcamActive()"
            (click)="capturePhoto()">
            Tomar Foto
          </button>
          
          <label class="btn btn-secondary">
            Subir Imagen
            <input
              type="file"
              accept="image/*"
              class="hidden"
              (change)="onFileSelected($event)"
            />
          </label>
        } @else {
          <button class="btn btn-error" (click)="retakePhoto()">
            Volver a Tomar
          </button>
          <button class="btn btn-success" (click)="acceptPhoto()">
            Aceptar Foto
          </button>
        }
      </div>
    </div>
  `
})
export class PhotoCaptureComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;

  private webcamService = inject(WebcamService);
  private imageProcessor = inject(ImageProcessorService);

  showVideo = signal(false);
  isWebcamActive = this.webcamService.isInitialized;
  previewImage = signal<string | null>(null);
  photoAccepted = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.isWebcamActive()) {
        this.showVideo.set(true);
        if (this.videoElement) {
          this.webcamService.attachVideo(this.videoElement.nativeElement);
        }
      } else {
        this.showVideo.set(false);
      }
    });
  }

  async ngOnInit() {
    await this.initializeWebcam();
  }

  ngOnDestroy() {
    this.webcamService.stopStream();
  }

  async initializeWebcam() {
    try {
      await this.webcamService.initialize();
    } catch (error) {
    }
  }

  async capturePhoto() {
    try {
      const photoData = await this.webcamService.captureImage();
      const resizedPhoto = await this.imageProcessor.resizeImage(photoData);
      this.previewImage.set(resizedPhoto);
      this.showVideo.set(false);
    } catch (error) {
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      try {
        const file = input.files[0];
        const resizedPhoto = await this.imageProcessor.resizeImage(file);
        this.previewImage.set(resizedPhoto);
        this.showVideo.set(false);
      } catch (error) {
      }
    }
  }

  async retakePhoto() {
    this.previewImage.set(null);
    this.showVideo.set(true);
    await this.initializeWebcam();
  }

  acceptPhoto() {
    this.photoAccepted.set(this.previewImage());
  }
}
