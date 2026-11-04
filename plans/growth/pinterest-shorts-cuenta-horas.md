# Brief de Pinterest y Shorts: Cuenta Horas

Para la sesión que publica en redes. Escrito el 3 de noviembre de 2026 desde el repo (paso 5 de
`plans/growth/PLAN.md`). Mismo formato que el brief de Maestro Calc: qué es, reglas, links, piezas
con números verificados, calendario y cómo medir.

## Qué es y para quién

**Cuenta Horas** (cuentahoras.com) son calculadoras gratis para quien cobra por hora en EE. UU.:
suman las horas de la semana, calculan las horas extra y revisan que el cheque esté completo. En
español y en inglés, sin registro, y el recibo de la semana se manda por WhatsApp.

- **Público principal:** trabajadores latinos que cobran por hora (construcción, limpieza,
  restaurantes, almacenes). Español neutro, de tú.
- **Público secundario:** trabajadores por hora en inglés, sobre todo con propinas u horas extra.
- **Lema del sitio:** ES "Lo que trabajas, bien contado." · EN "What you work, counted right."

## Reglas de contenido

**Sí**

- Español neutro con tú (Ingresa, Anota, Suma). "Overtime", "pay stub" y "taxes" se pueden dejar en
  inglés donde así se dicen (`plans/pago-del-trabajador/PLAN.md`, §6).
- Usar solo las cifras de abajo: salen del motor (`packages/pay-core`) con los valores que se
  muestran, y se recalcularon a mano.
- Decir siempre que es el pago **bruto**, antes de impuestos y descuentos.
- En las piezas de impuestos: "es una guía de las reglas federales, no asesoría fiscal".
- Declarar la voz de IA donde la plataforma lo pida.

**No**

- Prometer un reembolso o un monto exacto de impuestos: el ahorro es la deducción por tu franja, una
  estimación.
- Decir que las propinas o las horas extra quedan libres de **todo** impuesto: la deducción baja
  solo el impuesto federal sobre la renta; Seguro Social, Medicare y el impuesto estatal siguen
  igual.
- Decir que las horas extra diarias de California cuentan para la deducción: solo cuenta la mitad
  del tiempo y medio que exige la ley federal (FLSA), por las horas sobre 40 en la semana.
- Dar asesoría legal sobre reclamos de salario. Se puede decir "revisa tu cheque" y nada más.
- Usar "usted" o voseo.

### Datos de impuestos que no se cambian

De la guía `/es/guias/propinas-y-horas-extra-sin-impuestos` (revisada con fuentes del IRS el 3 de
noviembre de 2026) y de `packages/pay-core/src/deductions`:

- Años fiscales 2025 a 2028. La declaración del año fiscal 2026 se presenta a principios de 2027.
- Propinas: tope de $25,000 en cualquier declaración. Horas extra: $12,500, o $25,000 en
  declaración conjunta.
- Bajan $100 por cada $1,000 completos de MAGI sobre $150,000 (o $300,000 en conjunta).
- Hace falta un número de Seguro Social válido para trabajar; un matrimonio presenta declaración
  conjunta.
- W-2 de 2026: casilla 12 código TT (horas extra calificadas) y código TP (propinas en efectivo
  informadas); casilla 14b, código de ocupación con propinas.
- Se pide en el Schedule 1-A (Formulario 1040). Los números de línea vienen del **borrador** 2026 y
  pueden cambiar: no los pongas en un pin.

## Links

| Página                                      | Español                                                               | English                                                    |
| ------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Inicio                                      | https://cuentahoras.com/es                                            | https://cuentahoras.com/                                   |
| Horas trabajadas y horas extra              | https://cuentahoras.com/es/calculadora-de-horas-trabajadas            | https://cuentahoras.com/time-card-calculator               |
| Por hora a sueldo anual                     | https://cuentahoras.com/es/de-pago-por-hora-a-sueldo-anual            | https://cuentahoras.com/hourly-to-salary-calculator        |
| Sueldo anual a por hora                     | https://cuentahoras.com/es/de-sueldo-anual-a-pago-por-hora            | https://cuentahoras.com/salary-to-hourly-calculator        |
| Horas extra sin impuestos                   | https://cuentahoras.com/es/calculadora-horas-extra-sin-impuestos      | https://cuentahoras.com/no-tax-on-overtime-calculator      |
| Propinas sin impuestos                      | https://cuentahoras.com/es/calculadora-propinas-sin-impuestos         | https://cuentahoras.com/no-tax-on-tips-calculator          |
| Guía: deducir propinas y horas extra (2026) | https://cuentahoras.com/es/guias/propinas-y-horas-extra-sin-impuestos | https://cuentahoras.com/guides/no-tax-on-tips-and-overtime |
| Metodología                                 | https://cuentahoras.com/es/metodologia                                | https://cuentahoras.com/methodology                        |

Para mostrar un cálculo exacto: carga los valores en la calculadora; la dirección de la página se
actualiza con ellos ("El link lleva tus horas y tu tarifa; no se guarda nada en un servidor"), así
que copiarla de la barra da el mismo cálculo. En la tarjeta de horas también está "Mandar el recibo
por WhatsApp". Los links de abajo apuntan a la página; el link con los valores lo armas al grabar.

## La semana de ejemplo

Casi todas las piezas parten de la semana que la calculadora trae cargada: **lunes a viernes de
7:00 a 16:30 con 30 minutos de descanso sin pago (9 h por día) y sábado de 7:00 a 11:30 sin
descanso (4.5 h), a $22 la hora, regla federal.** Total: 49.5 h, de las cuales 40 regulares y 9.5
extra. Pago bruto: $880.00 + $313.50 = **$1,193.50**.

## 20 pines

> **En pausa.** El 2026-11-03 el dueño decidió no usar Pinterest para Cuenta Horas (no es su
> público). Los pines quedan como reserva por si esa decisión cambia; los Shorts de abajo sí van, en
> el canal de YouTube @CuentaHoras.

Pinterest tiene poco público latino (`plans/pago-del-trabajador/PLAN.md`, §8): por eso 12 de los 20
pines son de impuestos y salen en la temporada (diciembre a febrero), y la mitad va en inglés.
Formato 1000 × 1500, la cifra grande arriba y las entradas abajo en letra chica. `utm_campaign` =
id.

| Id     | Idioma | Título del pin                                 | Cifra en pantalla (entradas → resultado)                                                                                 | Link                                           |
| ------ | ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| ch-p01 | ES     | ¿Te pagaron bien la semana?                    | L-V 7:00-16:30 (30 min de descanso), S 7:00-11:30, $22/h → 49.5 h: 40 regulares + 9.5 extra = **$1,193.50** bruto        | /es/calculadora-de-horas-trabajadas            |
| ch-p02 | EN     | Check your paycheck in 1 minute                | Same week, $22/h, federal → 49.5 h, **$1,193.50** gross ($880.00 regular + $313.50 overtime)                             | /time-card-calculator                          |
| ch-p03 | ES     | La hora extra vale 1.5 veces                   | $22/h → **$33** por cada hora después de 40 en la semana; 9.5 h extra = $313.50                                          | /es/calculadora-de-horas-trabajadas            |
| ch-p04 | ES     | California: 4 días de 12 horas                 | L-J 7:00-19:00 sin descanso, $22/h → federal $1,144.00; California 32 regulares + 16 extra = **$1,232.00** ($88 más)     | /es/calculadora-de-horas-trabajadas            |
| ch-p05 | EN     | California pays by the day                     | Mon-Thu 12 h, $22/h → federal $1,144.00 vs California **$1,232.00**                                                      | /time-card-calculator                          |
| ch-p06 | ES     | $22 la hora, ¿cuánto es al año?                | $22/h, 40 h/semana, 52 semanas → **$45,760** al año; $3,813.33 al mes; $1,760.00 cada dos semanas                        | /es/de-pago-por-hora-a-sueldo-anual            |
| ch-p07 | EN     | $60,000 a year is how much an hour?            | $60,000/yr, 40 h, 52 weeks → **$28.85** an hour; $5,000.00 a month                                                       | /salary-to-hourly-calculator                   |
| ch-p08 | ES     | De $15 a $25 la hora, al año                   | 40 h, 52 semanas: $15 → $31,200 · $18 → $37,440 · $20 → $41,600 · $25 → **$52,000**                                      | /es/de-pago-por-hora-a-sueldo-anual            |
| ch-p09 | ES     | Propinas sin impuesto: cuánto te ahorras       | $8,000 de propinas, soltero, MAGI $45,000, franja 12% → deducción $8,000, ahorro **unos $960**                           | /es/calculadora-propinas-sin-impuestos         |
| ch-p10 | EN     | No tax on tips: what it saves                  | $8,000 tips, single, MAGI $45,000, 12% → deduction $8,000, saves **about $960**                                          | /no-tax-on-tips-calculator                     |
| ch-p11 | ES     | Horas extra sin impuesto: solo cuenta la mitad | 300 h extra a $22 → la parte calificada es $11 × 300 = **$3,300**; ahorra unos $396 en la franja del 12%                 | /es/calculadora-horas-extra-sin-impuestos      |
| ch-p12 | EN     | No tax on overtime: only the "half" counts     | 300 OT hours at $22 → $3,300 deduction, **about $396** at 12%                                                            | /no-tax-on-overtime-calculator                 |
| ch-p13 | ES     | El tope de las propinas: $25,000               | $30,000 de propinas, MAGI $45,000, 12% → deducción **$25,000** (el tope), ahorro unos $3,000                             | /es/calculadora-propinas-sin-impuestos         |
| ch-p14 | ES     | El tope de las horas extra: $12,500            | $30/h × 1,000 h extra → parte calificada $15,000, deducción **$12,500** soltero; 22% → unos $2,750                       | /es/calculadora-horas-extra-sin-impuestos      |
| ch-p15 | EN     | Where your W-2 shows tips and overtime         | W-2 2026: **box 12, code TT** (qualified overtime) and **code TP** (cash tips reported); box 14b, tipped occupation code | /guides/no-tax-on-tips-and-overtime            |
| ch-p16 | ES     | Tu W-2 2026: casilla 12 TT y TP                | TT = horas extra calificadas; TP = propinas en efectivo informadas; 14b = código de ocupación                            | /es/guias/propinas-y-horas-extra-sin-impuestos |
| ch-p17 | ES     | Lo que la deducción no cambia                  | Baja solo el impuesto federal sobre la renta; Seguro Social, Medicare y el estatal siguen igual                          | /es/guias/propinas-y-horas-extra-sin-impuestos |
| ch-p18 | EN     | Earn over $150,000? The deduction shrinks      | $12,500 tips, single, MAGI $165,500 → $100 less per full $1,000 over $150,000 → **$11,000**                              | /no-tax-on-tips-calculator                     |
| ch-p19 | ES     | ¿Quién califica? 4 puntos                      | Propina voluntaria, ocupación de la lista del IRS, SSN válido para trabajar, conjunta si estás casado                    | /es/guias/propinas-y-horas-extra-sin-impuestos |
| ch-p20 | EN     | Daily overtime in California does not count    | Only the FLSA half, for hours over 40 in the workweek, goes on Schedule 1-A                                              | /guides/no-tax-on-tips-and-overtime            |

## 10 guiones de Shorts

Formato del sistema de Maestro Calc: grabación de la pantalla del celular, sin cara, voz de IA en
español neutro, 30 a 45 segundos, la cifra grande al final. Link en la descripción con UTM.

**ch-v01: "¿Te pagaron bien la semana?"** → `/es/calculadora-de-horas-trabajadas`

- Gancho: "Trabajaste 49 horas y media. ¿Cuánto te tienen que pagar?"
- Abre la calculadora: la semana ya está cargada, de lunes a viernes de 7:00 a 16:30 con media hora
  de descanso y el sábado hasta las 11:30.
- Escribe $22 la hora, regla federal.
- Pantalla: 40 h regulares = $880.00; 9.5 h extra a $33 = $313.50.
- Cifra: **$1,193.50 bruto**. "Compáralo con tu talón de pago."

**ch-v02: "La hora extra no es la misma hora"** → `/es/calculadora-de-horas-trabajadas`

- Gancho: "Después de la hora 40, tu hora vale 1.5 veces."
- $22 × 1.5 = $33 por hora extra.
- Misma semana: 9.5 h extra = $313.50.
- Si te pagaran las 49.5 h a $22: $1,089.00. Con la extra bien pagada: **$1,193.50**.
- "La diferencia son $104.50 en una semana."

**ch-v03: "En California se cuenta por día"** → `/es/calculadora-de-horas-trabajadas`

- Gancho: "Cuatro días de 12 horas. Federal te da una cifra; California, otra."
- Lunes a jueves de 7:00 a 19:00, sin descanso, $22 la hora.
- Regla federal: 40 + 8 extra = $1,144.00.
- Cambia a California: después de 8 horas en el día es extra → 32 regulares + 16 extra.
- Cifra: **$1,232.00, $88 más**.

**ch-v04: "El día de 13 horas"** → `/es/calculadora-de-horas-trabajadas`

- Gancho: "Un lunes largo en California te da horas dobles."
- Semana de ejemplo, pero el lunes de 6:00 a 19:30 con 30 min de descanso (13 h).
- Federal: 53.5 h, $1,325.50.
- California: después de 12 h en el día, doble: 1 h doble ($44.00).
- Cifra: **$1,336.50**.

**ch-v05: "El séptimo día seguido"** → `/es/calculadora-de-horas-trabajadas`

- Gancho: "Trabajaste los siete días. En California el domingo se paga distinto."
- Siete días de 7:00 a 16:30 con 30 min de descanso (9 h), $22.
- Federal: 63 h, $1,639.00.
- California: el séptimo día, las primeras 8 h a 1.5 y el resto doble.
- Cifra: **$1,650.00**.

**ch-v06: "$22 la hora, ¿cuánto es al año?"** → `/es/de-pago-por-hora-a-sueldo-anual`

- Gancho: "¿Cuánto ganas al año si cobras $22 la hora?"
- 40 horas por semana, 52 semanas pagadas.
- Pantalla: $880.00 por semana, $1,760.00 cada dos semanas, $3,813.33 al mes.
- Con 50 semanas pagadas (dos sin pago): $44,000.
- Cifra: **$45,760 al año**, bruto.

**ch-v07: "¿Te conviene el sueldo fijo?"** → `/es/de-sueldo-anual-a-pago-por-hora`

- Gancho: "Te ofrecen $60,000 al año. ¿Cuánto es por hora?"
- 40 h por semana, 52 semanas.
- Pantalla: $5,000.00 al mes, $1,153.85 por semana.
- "Si con el sueldo fijo trabajas más de 40 horas, la hora te sale menos."
- Cifra: **$28.85 la hora**.

**ch-v08: "Propinas sin impuesto: cuánto te ahorras"** → `/es/calculadora-propinas-sin-impuestos`
(publicar entre diciembre y febrero)

- Gancho: "Si ganas propinas, en tu declaración 2026 puedes restarlas."
- $8,000 de propinas, soltero, ingreso de $45,000, franja del 12%.
- Deducción: $8,000 (el tope es $25,000).
- Aviso en pantalla: "Solo el impuesto federal sobre la renta. Seguro Social y Medicare siguen."
- Cifra: **unos $960 de ahorro**.

**ch-v09: "Horas extra sin impuesto: solo la mitad"** → `/es/calculadora-horas-extra-sin-impuestos`
(publicar entre diciembre y febrero)

- Gancho: "No restas todas tus horas extra. Solo la mitad del tiempo y medio."
- 300 horas extra en el año a $22 la hora.
- La parte calificada: $11 × 300 = $3,300.
- Franja del 12%.
- Cifra: **unos $396 de ahorro**. "Las extra diarias de California no cuentan."

**ch-v10: "Busca TT y TP en tu W-2"** → `/es/guias/propinas-y-horas-extra-sin-impuestos`
(publicar a fines de enero, cuando llegan los W-2)

- Gancho: "Este año tu W-2 trae dos códigos nuevos."
- Casilla 12, código TT: tus horas extra calificadas.
- Casilla 12, código TP: tus propinas en efectivo informadas.
- Casilla 14b: el código de tu ocupación con propinas.
- Cierre: "Pon esos montos en la calculadora y mira cuánto te ahorras." Aviso: "Guía, no asesoría
  fiscal."

## Calendario

Programado, nunca en ráfagas. La temporada que manda es la de impuestos: los W-2 llegan a fines de
enero y la declaración del año fiscal 2026 se presenta de enero a abril de 2027
(`plans/pago-del-trabajador/PLAN.md`, §8: "Pico de contenido: diciembre y enero").

| Semana                    | Pines                                            | Shorts                                             |
| ------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| 10 nov a 14 dic 2026      | ch-p01 a ch-p08, dos por semana (horas y sueldo) | ch-v01 a ch-v05, uno por semana desde el 17 nov    |
| 15 dic 2026 a 31 ene 2027 | ch-p09 a ch-p20, dos por semana (impuestos)      | ch-v06 a ch-v09, uno por semana; ch-v10 el 26 ene  |
| feb a abr 2027            | repinear los 3 pines de impuestos con más clics  | volver a subir ch-v08 y ch-v09 a mediados de marzo |

Después de abril, las piezas de horas y sueldo siguen todo el año; las de impuestos vuelven en
diciembre de 2027 con las cifras del año fiscal 2027 (revisar topes y formularios antes).

## Cómo medir

Cada link lleva UTM, por ejemplo:

`https://cuentahoras.com/es/calculadora-de-horas-trabajadas?utm_source=pinterest&utm_medium=social&utm_campaign=ch-p01`

- `utm_source`: pinterest o youtube. `utm_medium`: social. `utm_campaign`: el id de la pieza.
- La analítica de Cuenta Horas guarda solo los `utm_*` de la dirección y descarta los valores de la
  calculadora (`apps/pay/public/analytics.js`).

## Sin verificar o pendiente del dueño

- YouTube: el canal @CuentaHoras ya existe (creado por el dueño el 2026-11-03). Pinterest: no se usa
  para Cuenta Horas (decisión del dueño del 2026-11-03).
- Los números de línea del Schedule 1-A 2026 son del borrador; por eso ninguna pieza los usa.
- Los links con los valores ya cargados no están armados acá: se copian de la barra de direcciones
  al grabar.
