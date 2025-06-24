import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private defaultTitle = 'Mi Aplicación';

  constructor(private title: Title) {
    this.title.setTitle(this.defaultTitle);
  }

  setTitle(title: string) {
    this.title.setTitle(title);
  }

  resetTitle() {
    this.title.setTitle(this.defaultTitle);
  }
}
