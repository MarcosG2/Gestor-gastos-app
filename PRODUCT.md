# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que crean una cuenta para registrar sus propios gastos e ingresos. Lo usan en el teléfono y en la computadora, de día y de noche.

## Product Purpose

Llevar el mes: anotar movimientos, ver el balance, cuidar presupuestos y metas de ahorro. Éxito es poder registrar y revisar eso con la sesión iniciada, también sin conexión, y recuperar los cambios cuando vuelve la red.

## Positioning

No hay un reclamo de mercado confirmado. El mecanismo que sí existe: cuenta personal con gastos e ingresos, categorías, presupuesto mensual, historial exportable, análisis, movimientos recurrentes, metas de ahorro, cola offline y bloqueo local opcional.

## Operating Context

Interfaz en español. Se abre como sitio y como PWA. El tema claro y el oscuro se usan por igual; el cambio de tema sigue siendo un control de primera clase. Hay bloqueo local con WebAuthn, opt-in.

## Capabilities and Constraints

Confirmado en el producto:

- Registro, ingreso y recuperación de contraseña
- Gastos e ingresos con balance del mes
- Categorías y presupuestos mensuales, con aviso al 80% y al superar el tope
- Historial filtrable y export CSV
- Análisis con gráfico
- Movimientos recurrentes y metas de ahorro
- Lectura en caché, cola de sincronización y aviso de estado de red
- Aviso de nueva versión de la PWA

No incluido: notificaciones push. No hay cuentas compartidas de hogar.

Restricción de este rediseño, confirmada: se puede reordenar el maquetado. Los textos se quedan. Las funciones se quedan.

## Brand Commitments

Nombre: Gestor de Gastos.

El usuario fijó la identidad visual: moderna, paleta limpia, espaciado consistente, sin el aspecto genérico de interfaces generadas. Claro y oscuro conviven con el mismo peso.

## Evidence on Hand

Código y copy de la SPA en `web/src`. No hay testimonios, precios ni métricas de uso para citar.

## Product Principles

- La tarea del mes se entiende antes que el estilo.
- Un movimiento se puede cargar y revisar con red y sin red.
- Claro y oscuro son dos versiones del mismo sistema, no un añadido.
- El español de la interfaz no se reescribe para “sonar mejor”.
- Lo que no está en el producto no se inventa en la pantalla.
