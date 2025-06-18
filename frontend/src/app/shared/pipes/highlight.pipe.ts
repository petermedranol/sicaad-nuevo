import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  
  transform(text: string, searchQuery: string): string {
    if (!text || !searchQuery || searchQuery.trim() === '') {
      return text;
    }

    const query = searchQuery.trim();
    
    // Usar una expresión regular para buscar coincidencias sin distinguir mayúsculas/minúsculas
    const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
    
    // Reemplazar las coincidencias con un span resaltado
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  private escapeRegExp(string: string): string {
    // Escapar caracteres especiales de regex
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

