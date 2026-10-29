---
name: Gestor de Gastos
description: Banda verde para el balance del mes, filas con filete y una sola voz tipográfica.
colors:
  band: "#1e4d3f"
  on-band: "#f4f6f5"
  ground-light: "#f4f6f5"
  ground-dark: "#121614"
  ink-light: "#141816"
  ink-dark: "#e7eeea"
  muted-light: "#3e4c45"
  muted-dark: "#b7c4bc"
  paper-light: "#ffffff"
  paper-dark: "#1a211e"
  line-light: "#d5ddd8"
  line-dark: "#2c3833"
  link-light: "#1a4538"
  link-dark: "#b7ddd4"
  warn: "#8a5414"
  warn-on-band: "#f3d7a1"
  danger: "#9f2d2d"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Segoe UI, sans-serif"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  display-min:
    fontFamily: "Schibsted Grotesk, Segoe UI, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  side-figure:
    fontFamily: "Schibsted Grotesk, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0em"
  body:
    fontFamily: "Schibsted Grotesk, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
  label:
    fontFamily: "Schibsted Grotesk, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0em"
rounded:
  control: "6px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.on-band}"
    textColor: "{colors.band}"
    rounded: "{rounded.control}"
    padding: "14px 18px"
  button-solid:
    backgroundColor: "{colors.band}"
    textColor: "{colors.on-band}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  input:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

## Overview

**Creative North Star: "La banda de decisión"**

El mes se entiende en una sola banda verde: el nombre del mes, el balance en grande y la acción de cargar. El resto de la pantalla es suelo claro u oscuro, con los movimientos en filas separadas por un filete de un píxel.

**Key Characteristics:**

- El verde `#1e4d3f` es el riel y la banda, de día y de noche.
- Una sola familia, Schibsted Grotesk, también para las cifras.
- El espaciado sale de 8, 12, 16, 24 y 32.
- Claro y oscuro son el mismo sistema con los suelos invertidos.

## Colors

El verde de la banda no se usa como acento suelto sobre gris. Aviso (`#8a5414`, o `#f3d7a1` sobre la banda) solo para presupuesto y edición. El rojo `#9f2d2d` solo para borrar o un error.

## Typography

Cifras con `tabular-nums`. El balance del mes usa el estilo display. Los rótulos de formulario usan el estilo label. No hay una segunda familia para títulos.

## Layout

En escritorio el riel mide 240px. El contenido del panel cabe en 48rem: banda, formulario, lista. En el teléfono el riel pasa a una barra superior del mismo verde. Hay más aire encima de un título que debajo.

## Elevation & Depth

No hay sombras. La separación es el filete `#d5ddd8` de día y `#2c3833` de noche.

## Shapes

Controles a 6px. La banda no tiene radio.

## Components

La banda lleva el balance y, en el panel, el botón de alta. Las filas de gasto e ingreso no van en tarjetas. El tema claro, oscuro o de sistema sigue en Mi Perfil.

## Do's and Don'ts

- Usá el verde del riel para la navegación y para la acción principal.
- Dejá el aviso ámbar para un estado de presupuesto, no para decorar.
- No vuelvas a las tres tarjetas de métricas con gradiente.
- No uses índigo, Inter, ni sombra suave bajo cada bloque.
- No reescribas los textos de la interfaz para cambiar el tono.
