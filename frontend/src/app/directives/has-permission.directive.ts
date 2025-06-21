import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from '../services/permission.service';

/**
 * Directiva para mostrar/ocultar elementos basándose en permisos del usuario
 * 
 * Uso:
 * <div *hasPermission="'/configuration/users'">Solo visible si tiene acceso a usuarios</div>
 * <button *hasPermission="module:'configuración'">Solo visible si tiene acceso al módulo</button>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);
  
  private permission: string = '';
  private isModule: boolean = false;
  
  @Input() set hasPermission(value: string) {
    this.permission = value;
    this.updateView();
  }
  
  @Input() set hasPermissionModule(value: string) {
    this.permission = value;
    this.isModule = true;
    this.updateView();
  }
  
  ngOnInit() {
    this.updateView();
  }
  
  ngOnDestroy() {
    this.viewContainer.clear();
  }
  
  private updateView() {
    if (!this.permission) {
      return;
    }
    
    const hasAccess = this.isModule 
      ? this.permissionService.hasAccessToModule(this.permission)
      : this.permissionService.hasAccessToRoute(this.permission);
    
    if (hasAccess) {
      // Mostrar elemento
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      // Ocultar elemento
      this.viewContainer.clear();
    }
  }
}

