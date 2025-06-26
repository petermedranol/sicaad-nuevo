import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(text: string, searchQuery: string): SafeHtml {
    if (!text || !searchQuery || searchQuery.trim() === '') {
      return text;
    }

    const query = searchQuery.trim();
    
    // Usar una expresión regular para buscar coincidencias sin distinguir mayúsculas/minúsculas
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    
    // Reemplazar las coincidencias con un span resaltado
    const replaced = text.replace(regex, '<mark class="bg-[#ff8c00] text-white px-1 rounded text-xs inline-block">$1</mark>')
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

  private escapeRegExp(string: string): string {
    // Escapar caracteres especiales de regex
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

