/**
 * Script para debugging de permisos
 * Ejecuta en la consola del navegador para simular diferentes usuarios
 */

// Usuario administrador (acceso completo)
function setAdminUser() {
  const adminMenu = [
    {
      id: 1,
      title: "Inicio",
      icon: "home",
      route: "/dashboard"
    },
    {
      id: 2,
      title: "Configuración",
      icon: "settings",
      route: "/configuration",
      submenu: [
        {
          id: 21,
          title: "Usuarios",
          icon: "users",
          route: "/configuration/users"
        },
        {
          id: 22,
          title: "Roles",
          icon: "shield",
          route: "/configuration/roles"
        }
      ]
    }
  ];
  
  localStorage.setItem('userMenu', JSON.stringify(adminMenu));
  localStorage.setItem('user', JSON.stringify({
    id: 1,
    name: 'Pedro Medrano',
    email: 'pedro@cecytec.edu.mx',
    role: 'Administrador'
  }));
  
  console.log('✅ Usuario administrador configurado');
  console.log('📋 Menú:', adminMenu);
}

// Usuario limitado (sin acceso a usuarios)
function setLimitedUser() {
  const limitedMenu = [
    {
      id: 1,
      title: "Inicio",
      icon: "home",
      route: "/dashboard"
    },
    {
      id: 3,
      title: "Reportes",
      icon: "chart",
      route: "/reports"
    }
  ];
  
  localStorage.setItem('userMenu', JSON.stringify(limitedMenu));
  localStorage.setItem('user', JSON.stringify({
    id: 2,
    name: 'Usuario Limitado',
    email: 'usuario@cecytec.edu.mx',
    role: 'Usuario'
  }));
  
  console.log('⚠️ Usuario limitado configurado (sin acceso a usuarios)');
  console.log('📋 Menú:', limitedMenu);
}

// Usuario sin menú (caso de error)
function setUserWithoutMenu() {
  localStorage.removeItem('userMenu');
  localStorage.setItem('user', JSON.stringify({
    id: 3,
    name: 'Usuario Sin Menú',
    email: 'sinmenu@cecytec.edu.mx',
    role: 'Sin Permisos'
  }));
  
  console.log('🚫 Usuario sin menú configurado');
}

// Mostrar estado actual
function showCurrentPermissions() {
  const menu = localStorage.getItem('userMenu');
  const user = localStorage.getItem('user');
  
  console.log('👤 Usuario actual:', user ? JSON.parse(user) : 'No hay usuario');
  console.log('📋 Menú actual:', menu ? JSON.parse(menu) : 'No hay menú');
}

// Exportar funciones globalmente para usar en consola
window.debugPermissions = {
  setAdminUser,
  setLimitedUser,
  setUserWithoutMenu,
  showCurrentPermissions
};

console.log(`
🔧 Funciones de debugging disponibles:

debugPermissions.setAdminUser()        - Usuario con acceso completo
debugPermissions.setLimitedUser()      - Usuario sin acceso a usuarios  
debugPermissions.setUserWithoutMenu()  - Usuario sin menú
debugPermissions.showCurrentPermissions() - Mostrar estado actual

Después de cambiar usuario, recarga la página para ver el efecto.
`);

