import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageProcessorService {
  async resizeImage(file: File | string, maxWidth = 350, maxHeight = 350): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Calcular las nuevas dimensiones manteniendo el aspect ratio
        let [width, height] = this.calculateAspectRatio(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Crear canvas para el resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      // Si es un File, convertirlo a URL
      if (file instanceof File) {
        img.src = URL.createObjectURL(file);
      } else {
        img.src = file;
      }
    });
  }

  private calculateAspectRatio(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
  ): [number, number] {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return [srcWidth * ratio, srcHeight * ratio];
  }

  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }
}
