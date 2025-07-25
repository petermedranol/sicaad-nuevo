import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div
      class="logo-cecytec rounded-lg flex items-center justify-center"
      [class.w-10]="size === 'normal'"
      [class.h-10]="size === 'normal'"
      [class.w-8]="size === 'small'"
      [class.h-8]="size === 'small'">
      <span
        class="text-white font-bold"
        [class.text-lg]="size === 'normal'"
        [class.text-sm]="size === 'small'">
        S
      </span>
    </div>
  `
})
export class LogoComponent {
  @Input() size: 'normal' | 'small' = 'normal';
}

