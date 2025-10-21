# Terser Configuration Reference (Safe for API and FormData)

Este documento describe la configuración recomendada de **Terser** para maximizar la compatibilidad y evitar romper código dinámico como `FormData`, `fetch`, o `Blob`.

---

## 🔧 Configuración General

| Propiedad | Descripción |
|------------|--------------|
| **ecma** | Define el nivel de compatibilidad ECMAScript del código de salida. `5` asegura que el código sea compatible con navegadores antiguos. |
| **safari10** | Corrige errores conocidos de minificación que afectan a Safari 10. Muy recomendable mantener en `true`. |
| **sourceMap** | Genera mapas de código fuente para depuración. Puede ser `inline` (dentro del archivo) o `external` (archivo separado). |
| **output.comments** | Elimina comentarios del código final. |
| **output.ascii_only** | Fuerza a que todos los caracteres sean ASCII (evita problemas con caracteres Unicode). |

---

## ⚙️ Opciones de Compresión (`compress`)

| Propiedad | Valor | Descripción |
|------------|--------|--------------|
| **passes** | `1` | Cuántas pasadas de optimización realiza. Más pasadas implican más agresividad; 1 es el punto seguro. |
| **arrows** | `false` | Evita transformar funciones normales en funciones flecha, que pueden alterar el `this`. |
| **booleans** | `true` | Simplifica expresiones booleanas redundantes. |
| **comparisons** | `false` | Evita reordenar comparaciones, lo que puede alterar la lógica. |
| **typeofs** | `false` | Mantiene las comprobaciones `typeof` sin alterarlas. |
| **keep_fargs** | `true` | Conserva los argumentos de funciones aunque no se usen, importante para APIs que dependen de la firma de funciones. |
| **keep_infinity** | `true` | Evita reemplazar `Infinity` por expresiones más cortas que podrían romper el código. |

---

## ✂️ Opciones de Renombrado (`mangle`)

| Propiedad | Valor | Descripción |
|------------|--------|--------------|
| **safari10** | `true` | Previene problemas de nombres mangled en Safari 10. |
| **toplevel** | `false` | Si se pone en `true`, renombra variables globales, lo que puede romper código que usa `FormData`, `fetch`, u objetos externos. Mantener en `false` para mayor seguridad. |

---

## ✅ Recomendaciones Finales

- **No activar `toplevel`** si tu código usa variables globales o APIs de navegador.  
- **Evita `passes > 1`** cuando haya código que manipula archivos, formularios o conexiones HTTP.  
- **Mantén `safari10: true`** siempre, mejora la compatibilidad incluso en navegadores modernos.  
- Usa comentarios `/* terser-ignore-start */` y `/* terser-ignore-end */` para excluir bloques críticos.

---

**Última actualización:** Octubre 2025
