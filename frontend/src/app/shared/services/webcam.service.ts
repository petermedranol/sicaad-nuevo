import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebcamService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  public isInitialized = signal(false);

  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 350 },
          height: { ideal: 350 },
          facingMode: 'user'
        }
      });
      
      this.isInitialized.set(true);
      return true;
    } catch (error) {
      return false;
    }
  }

  attachVideo(video: HTMLVideoElement) {
    if (this.stream) {
      this.videoElement = video;
      this.videoElement.srcObject = this.stream;
    }
  }

  captureImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.videoElement || !this.stream) {
        reject('Webcam not initialized');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Could not get canvas context');
        return;
      }

      ctx.drawImage(this.videoElement, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    });
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.isInitialized.set(false);
  }
}
