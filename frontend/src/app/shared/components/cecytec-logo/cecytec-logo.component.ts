import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cecytec-logo',
  imports: [CommonModule],
  templateUrl: './cecytec-logo.component.html',
  styleUrl: './cecytec-logo.component.css'
})
export class CecytecLogoComponent {
  @Input() showText = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'light' | 'dark' = 'light';

  get logoWidth() {
    if (!this.showText) return this.size === 'small' ? '20' : this.size === 'large' ? '32' : '24';
    return this.size === 'small' ? '100' : this.size === 'large' ? '160' : '130';
  }

  get logoHeight() {
    return this.size === 'small' ? '20' : this.size === 'large' ? '32' : '24';
  }
}
