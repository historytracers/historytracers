# Videos — es-ES

Este directorio contiene archivos de guiones de video para el idioma español.

## Estructura del Directorio

Cada idioma soportado tiene su propio subdirectorio siguiendo el patrón:

```text
videos/<locale>/<uuid>.txt
```

Por ejemplo:

```text
videos/es-ES/bbf4bee1-3436-4368-b669-9b9fc89455a3.txt
```

## Formato del Archivo

Cada archivo `.txt` es un guion de video (texto de narración) identificado por un UUID. El nombre del archivo (sin extensión) es el UUID del video — el mismo UUID se comparte entre los tres directorios de idiomas (`en-US`, `es-ES`, `pt-BR`) para el mismo video.

### Contenido del Guion

Un archivo de guion contiene:

1. **Línea de título** — el título del video y el idioma entre paréntesis, ej. `History Tracers — ¿Qué es? (Español)`
2. **Línea en blanco**
3. **Párrafos de narración** — el texto hablado del video, escrito como párrafos cortos separados por líneas en blanco

La narración es texto sin formato. Sin markdown, sin HTML, sin marcadores de tiempo. Está destinada a ser leída en voz alta por un narrador o convertida a voz.

### Restricciones

- Duración máxima: **50 segundos** de contenido hablado (~120–150 palabras dependiendo del idioma y el ritmo).
- El texto debe ser autónomo — debe tener sentido sin requerir visuales, aunque los visuales pueden acompañarlo.
- Cada versión en idioma debe transmitir el mismo significado, no una traducción palabra por palabra. Se prefiere la redacción natural en cada idioma.

## Videos Actuales

| UUID | Título | Descripción |
|------|--------|-------------|
| `bbf4bee1-3436-4368-b669-9b9fc89455a3` | History Tracers — ¿Qué es? | Una visión general de History Tracers: conocimiento interdisciplinario, cómo diferentes culturas desarrollaron independientemente herramientas de conteo (Soroban, Suanpan, Schyoty, Yupana), y una invitación a aprender en la plataforma de código abierto. |

## Agregar un Nuevo Video

1. Generar un UUID: `cat /proc/sys/kernel/random/uuid`
2. Crear el archivo de guion `videos/es-ES/<uuid>.txt` con el texto de narración
3. Crear el mismo archivo en `videos/en-US/<uuid>.txt` y `videos/pt-BR/<uuid>.txt` con contenido traducido
4. Mantener los tres archivos estructuralmente idénticos (mismo número de párrafos, mismo significado)
5. Verificar que el conteo de palabras se mantenga dentro del límite de50 segundos
