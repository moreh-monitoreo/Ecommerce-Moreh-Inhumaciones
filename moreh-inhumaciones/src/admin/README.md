# Moreh Admin · Variante B — Editorial Densa

Código vanilla (HTML + CSS + JS, sin frameworks) listo para integrar en tu estructura `src/admin/` actual.

## Estructura

```
variant-b/
├── index.html                 ← hub para navegar entre todas las páginas
├── README.md                  ← este archivo
├── css/
│   └── admin.css              ← sistema de diseño completo
├── js/
│   └── layout.js              ← sidebar + topbar inyectados
└── pages/                     ← 14 páginas, una por módulo
    ├── dashboard.html         · KPIs, gráficas, atención + actividad
    ├── productos.html         · Tabla con thumbnails y filtros
    ├── categorias.html        · Árbol jerárquico
    ├── inventario.html        · Stock por sucursal + barras
    ├── ordenes.html           · Tabs de estado + multi-paso
    ├── contratos.html         · Servicios funerarios
    ├── clientes.html          · Lista + drawer de detalle
    ├── leads.html             · Kanban + tabla
    ├── sucursales.html        · Tarjetas agrupadas por estado
    ├── usuarios.html          · Cuentas del panel
    ├── roles.html             · Matriz de permisos
    ├── cms.html               · Banners + settings del sitio
    ├── reportes.html          · Charts.js + exportar Excel
    └── auditoria.html         · Bitácora + modal diff
```

## Integración paso a paso

1. **Backup** de tus archivos actuales (`admin.css`, `layout.js`, etc.)
2. Copia `variant-b/css/admin.css` → `src/admin/css/admin.css`
3. Copia `variant-b/js/layout.js` → `src/admin/js/layout.js`
4. Copia los HTMLs a `src/admin/pages/`
5. Las páginas que ya tienes (`ordenes.html`, `contratos.html`, etc.) ya usan los mismos selectores; solo asegúrate de que tengan:
   ```html
   <link rel="stylesheet" href="../css/admin.css">
   <script src="../js/api.js"></script>
   <script src="../js/layout.js"></script>
   <script src="../js/auth.js"></script>
   ```
6. En las páginas existentes, los reemplazos rápidos son:
   - `btn-admin btn-primary` → `btn btn-primary`
   - `btn-admin btn-outline`  → `btn`
   - `btn-admin btn-danger`   → `btn btn-danger`
   - `pill-green`, `pill-red` ... → siguen funcionando con el mismo nombre (alias mantenidos)
   - El resto de selectores (`.card`, `.kpi-card`, `.admin-table`, `.modal-overlay`, `.toolbar-search`, `.empty-state`, `.toast`) siguen disponibles con la nueva apariencia.

## Conservar tu `api.js` y `auth.js`

Estos no cambian; sólo el layout y los estilos.

## Sistema de diseño

- **Tipografía**: Inter 400/500/600/700, `font-feature-settings: 'cv11','ss03'`, números tabulares por defecto en KPIs y tablas.
- **Color**: blanco / grises Linear (#fafafa, #eaeaea, #71717a, #0a0a0a), acento gold (#9a6b2a) usado mínimamente — solo en el badge "Admin", banners de auditoría, y marcadores destacados.
- **Bordes**: hairlines (#eaeaea, #f1f1f1) en lugar de tarjetas con sombra. Las tablas dividen con bordes inferiores ligeros (#f1f1f1).
- **Radii**: 4 / 5 / 6 / 8 / 10 px.
- **Densidad**: 12.5 px de fuente base, padding `9-14px` en tablas, `5-10px` en botones. KPI strip de 6 columnas.

## Diseño del menú item (sidebar-link)

```html
<a href="productos.html" class="sidebar-link active">
  <svg>…</svg>
  <span>Productos</span>
  <span class="sidebar-link-count">142</span>   <!-- ó -->
  <span class="sidebar-link-dot"></span>        <!-- para alertas/nuevos -->
</a>
```

Estados:
- **Default**: texto gris medio (`var(--ink-soft)`), icono apagado, sin fondo.
- **Hover**: fondo gris muy claro (`--surface-alt`), texto e icono se oscurecen.
- **Active**: "tarjeta" blanca con borde hairline + 1px de sombra ultra-sutil (estilo Linear). Texto e icono en negro pleno.
- **Focus visible** (teclado): anillo de 2px alrededor.
- **Count badge**: tabular-nums, alineado a la derecha. Muted por default, ink en hover/active.
- **Dot indicator**: 6×6 px dorado con halo del color del sidebar para indicar "hay algo nuevo".

Secciones (`.sidebar-section-label`): tipografía pequeña 10px, mayúsculas, letterspacing 0.08em, color gris claro. Separación visual sin líneas.

## Convenciones de uso

- Para botones primarios usa **negro pleno** (`.btn-primary`), no el navy original — más Linear-like.
- Acento dorado **solo para**: badge "Admin" del sidebar, dot de notificación, banners de auditoría (`pill-gold`, `banner-amber`), y marcador del top de ventas por sucursal.
- Para tablas con muchas columnas, mantén el padding bajo (9px vertical) y usa `tabular-nums` en columnas numéricas.
- KPIs siempre con sparkline + delta. Si una métrica no tiene tendencia, omite el sparkline y deja solo el número.

## Cmd/Ctrl + K

El layout incluye atajo `⌘K` / `Ctrl K` que da foco al buscador del sidebar. Filtra los links en vivo conforme escribes.

## Atajos de las páginas

- **Esc** cierra el modal abierto.
- **Click fuera** del modal lo cierra también.
- Las tablas tienen checkbox de "seleccionar todo".
