# Jelp App - Javascript Challange

Este repositorio es la entrega oficial para la prueba técnica que me fue encomendada por parte de Jelp App. El presente readMe tiene como propósito explicar un poco sobre mi proceso de pensamiento al abordar éste problema, así como algunas instrucciones para su ejecución. Será presentado a manera de timeline.

El producto final es un pequeño servidor escrito con el framework [Sails v1](https://sailsjs.com), que tiene como propósito atender las solicitudes y manejar un sistema de reservaciones de un hotel.


## Indicaciones del Desafío

Las instrucciones que recibí fueron las siguientes (simplificadas):
- Se deberán desarrollar un proyecto backend para registrar una reservación de un hotel, considerando los siguientes  endpoints:

  - Creación de reserva.
    - El sistema deberá buscar y asignar una habitación disponible.
    - Devolver un folio o id de reservación.

  - Cancelación de reserva.
    - Deberá liberar la habitación reservada.

  - Consulta de reservacions
    - Deberá retornar todas las reservaciones.
    - Deberá retornar una reservación basado en un id específico.


## Primeras ideas

Una vez esclarecidas mis dudas para delimitar los alcances del problema (obviando autenticación y lógica adicional que se requiriría en este contexto), pude identificar que la problemática particular a resolver, residía en desarollar un algoritmo que pudiera determinar si existían habitaciones disponibles para un rango de fechas en particular, así como que devolviera alguna habitación en la cual el nuevo huesped pudiera ocupar.

Habilitar los endpoints es una tarea en cierta medida estándar, entonces, este readMe se concentrará en la resolución del problema anterior, mencionando brevemente los detalles de implementación en la RESTApi.


### Estructura de los Datos

Una parte muy importante de resolver este tipo de algoritmos, es poder decidir de que manera se van a almacenar los datos. En este particular caso, tuve la libertad de crear los registros por mi cuenta, de manera que la forma que iban a tener los datos fue moldeada a partir de la propuesta de solución que presentara. Si bien la estructura cambio un poco a partir de la implementación de la solución, cuando empecé a diseñar como quería realizar ésto, se me presentaron 2 opciones

#### Los Días son Entidades

En un primer momento visualicé que registrar los días como entidades realizaba sentido, o al menos ordenar entradas basados en este atributo, ya que, la información de entrada que necesita el algoritmo de una u otra manera, es, las reservaciones previas, los cuartos que estas ocupan, y la información de la nueva reservación.

Sin embargo, al darle un poco mas de pensamiento a esta idea, se volvió un poco complicado, ya que si decidía hacer esto, idealmente, iba a llegar a tener una entidad por cada día, tuviera o no reservación. Adicionalmente, me gustaría tener la información detallada de las reservaciones una vez consultado el dia, de manera que utilizar este acercamiento tendría las siguiente consecuencias.

  - Una sola reservación estaría partida en multiples días.
  - Tendría que almacenar la referencia de la reservación en el documento del día, o llenar el día con el documento completo de reservación, lo cual es incluso menos factible.

Pensar en ésta y algunas otras complicaciones, hizo que me decantara por, probablemente la opción intuitiva.

#### Las Reservaciones son Entidades

Esta se trata de la primera opción que pasó por mi mente, y la más lógica, sin embargo, siempre es positivo explorar alternativas, en caso de que resulten ser mas favorables. Una vez decidido que cosa iba a ser mi entidad principal, fue necesario definir la estructura que iban a tener éstos objetos en la base de datos de Mongo. La opción que me pareció mas adecuada para , fue la siguiente:


```ts

  // Interface presentada con fines demostrativos
  interface Reservation {
    "reservationId": string,
    "clientName": string,
    "roomNo": number,
    "startDate": string,
    "endDate": string,
    "orderStatus": "active" | "cancelled"
  }

```

En lo particular decidí agregar un segundo ID, pero más pequeño, debido a que el ID que genera mongo no es precisamente amigable, y no me sentí en la comodidad de sobreescribirlo, sobre todo porque dada la técnica con la que generé este segundo ID no podía garantizar uniqueness de la llave. El ID se genera con la librería [nanoid](https://www.npmjs.com/package/nanoid), con una cadena de 5 caracteres de largo.

Si bien tenia la opción de guardar los días de la reservación como un arreglo de días, no ví realmente el propósito de hacer ésto, ya que, pensandolos como días consecutivos, de igual manera lo que necesito para resolver el problema es el primer y último día en el que el cliente desea hospedarse. El resto de las propiedades tienen un nombre lo suficientemente claro.


## Desarollo de la Lógica Principal

Dado que no contaba con familiaridad en Sails, decidí explorar un poco las características del problema en un entorno *vanilla* (puede encontrarse en la carpeta `playground`), el primer código que escribí fue una pequeña función que me permitiera generar diversos intentos de reservación para mandarlos al servidor y así contar con algunos datos para realizar pruebas,

Gracias a que el servidor no contaba con ninguna lógica para determinar si una reservación era posbible, si realizaba las peticiones *como salieran*, iba a tener una variedad de registros inválidos, así que, decidí escribir una función, que, dado un arreglo de objetos similares a las reservaciones, y un objeto que contuviera la fecha de llegada y de salida de un huesped, devolviera un arreglo con los números de cuartos en los cuales era posible hospedarse, es decir, los cuartos que se encontraran desocupados durante un rango de fechas en específico.

Implementar esta función resultó clave, ya que con unas pequeñas modificaciones, se trata de la misma lógica que resultaba necesario implementar en el servidor.

### *La Función*

El siguiente código viene a solucionar justamente este problema, algo que debo notar, es que recurrí a una librería externa para parsear y manipular las fechas, es una librería muy amigable llamada [DayJs](https://day.js.org/) que tiene muchas similitudes con [Moment](https://momentjs.com/), pero con la diferencia de ser inmutable (y un reemplazo sugerido).

Seccionaré la función en tres partes, que sinceramente, tendría sentido escribirlo en una funciones a parte, pero, no se trata de algo precisamente reutilizable (al menos, para los objetivos de éste mini proyecto), pero la lógica de la función no es precisamente compleja y no resulta larga tampoco. Sin embargo, si vale la pena que resuelve lo que necesita en 3 pasos distintos.

```ts

const verifyAvailability = (records, intendedRegistration, noOfRooms) => {
  const { startDate, endDate } = intendedRegistration;

  const roomsOcuppiedDays = {};

  for (
    let i = 0;
    dayjs(startDate).add(i, "day").diff(dayjs(endDate), "days") <= 0;
    i++
  ) {
    const currentDay = dayjs(startDate).add(i, "day").toDate().toDateString();

    roomsOcuppiedDays[currentDay] = new Array(noOfRooms)
      .fill(0)
      .map((_, idx) => idx + 1);
  }

```


En este primer momento de la función, lo que me interesa es obtener un objeto que tenga las siguientes características:

  - Cada llave de este objeto es una fecha.
  - El valor de las llaves es un arreglo que tiene los números del 1 a cantidad de cuartos en el hotel.

Este objeto se construye a partir de hacer un ciclo que, de manera simple, itera sobre cada uno de los días entre la fecha de llegada y la fecha de salida del intento de reservación. Después de obtener la etiqueta *amigable* del día (el DateString), construye el objeto descrito anteriormente.

La técnica de para generar el arreglo de los números del 1 al n, es una idea que me gusta bastante, iniciamos el arreglo vacío de tamaño n, pero necesitamos llenarlo, porque si no, `map` no itera sobre ningún elemento ya que serían undefined. Después aprovechamos los índices para llenar con los números consecutivos.


```ts

  const overlappingKeys = Object.keys(roomsOcuppiedDays);

  records.forEach((record) => {
    const { startDate, endDate, roomNo } = record;

    for (
      let i = 0;
      dayjs(startDate).add(i, "day").diff(dayjs(endDate), "days") <= 0;
      i++
    ) {
      const currentDay = dayjs(startDate).add(i, "day").toDate().toDateString();

      if (overlappingKeys.includes(currentDay)) {
        roomsOcuppiedDays[currentDay] = roomsOcuppiedDays[currentDay].filter(
          (availableRoom) => availableRoom !== roomNo
        );
      }
    }
  });

```


Obtenemos el arreglo `overlappingKeys`, que tiene como propósito de tener los `strings` de las fechas, este arreglo en particular se usa en el siguiente ciclo, el cual, a grandes rasgos, recorre todos los registros que se le proporcionaron a la función, y de la misma manera que en el for anterior, recorremos cada día y obtenemos su string *bonita*, para posteriormente revisar si el día que estamos revisando se encuentra en los días que el cliente quiere quedarse. En caso de que si, removemos de la lista de cuartos disponible el cuarto de la reservación que estamos revisando.

Una crítica que tendría en retrospectiva, es que recorre todos los días de la reservación del arreglo, lo cuál podría ser problemático, en caso de que a partir del día 5, por ejemplo, ya no interseque, una solución a ésto será calcular los mínimos, si las overlappingKeys, o el día final de la reservación que estamos revisando.

El resultado de esta sección de la función, es obtener un objeto, el cuál tiene como llaves los días que el intento de registro abarca, y como valores, arreglos con números, que representan los cuartos que están disponibles ese determinado días.


```ts

  const availabilityOfRoomsPerDays = Object.values(roomsOcuppiedDays);

  const canAccomodateIn = new Array(noOfRooms)
    .fill(0)
    .map((_, idx) => idx + 1)
    .filter((roomNumber) =>
      availabilityOfRoomsPerDays.every((arrayOfRooms) =>
        arrayOfRooms.includes(roomNumber)
      )
    );

  return canAccomodateIn;
};
// End Verify Availability

```


Para concluir la función, en este tercer *momento* obtenemos todos los arreglos que obtuvimos como resultado de la sección anterior, utlizamos funciones de arreglos para encontrar los numeros de cuartos que aparezcan en todos los días del rango. Una vez obtenido este arreglo, lo devolvemos.

La función principal termina aquí, porque tenemos la garantía de que si registramos a un cliente con los datos que ya se tenían, en cualquier número de cuarto que regrese éste arreglo, no tendremos problemas.


## El servidor

Pese a que muchas de las cosas que fue necesario de implementar en el servidor, hay algunos aspectos que resulta pertinente notar

### Validaciones

Dado que prácticamente todas las operaciones del sistema involucran fechas, me tomé la libertad de utilizar *policies* de sails sobre los endpoints importantes para realizar éstas validaciones sobre las entradas, que son 2:

  - Que las fechas sean parseables por dayjs.
  - Que la fecha de fin sea al menos el mismo día del de inicio (para creación de reservación).

### Otra Función Helper

Una función que consideré pertinente de extraer de una lógica de los controladores (con el propósito de reutilizarlo en una posible expansión de las funcionalidades del servidor). Fue la función `isDateRangeOverlapping`, que tiene como propósito identificar si dos rangos de días se intersecan. Esto es útil en la creación de reservaciones, ya que, aunque la función `verifyAvailability` no es extremadamente costosa, no quisiera aplicarla para absolutamente todos los registros. Entonces, esta función nos permite filtrar registros que no afectaran la disponibilidad de cuartos en una fecha determinada.


```ts


const isDateRangeOverlapping = (firstRange, secondRange) => {
  const isToTheLeft = dayjs(firstRange.endDate).isBefore(
    dayjs(secondRange.StartDate),
    "d"
  );

  const isToTheRight = dayjs(firstRange.startDate).isAfter(
    dayjs(secondRange.endDate),
    "d"
  );

  return !(isToTheRight || isToTheLeft);
};


```

## Instrucciones de Instalación

Una vez clonado el repositorio, hay que ejecutar el comando

```
  npm install
```

Para instalar las dependencias correspondientes.

Para levantar el servidor, es necesario tener un servidor de Mongo ejecutandose en el URL específicado en `config/datastores.js`, el valor que tiene actualmente es `mongodb://localhost:27017/sails-test`.

Una vez que se tengan éstos requerimentos, bastará con utilizar el comando (asumiendo que se tiene `sails` instalado de manera global)

```
  sails lift
```

El puerto por defecto es `1337`.

Si la base de datos se encuentra vacía, es probable que desee correr el script que llena algunos registros de manera automática, el archivo que se encarga de ésto es `playground/index.js`, el cual puede ser ejecutado con

```
  npm run playground
```

### Nota

Tal vez quiera revisar los parametros de la función que ejecuta éste script


```ts

  const main = async (
    numberOfReservations = 20,
    numberOfRooms = 15,
    noOfDaysForward = 14
  ) => {
    await generateDummyRecords(
      numberOfReservations,
      numberOfRooms,
      noOfDaysForward
    );
  };

  main();

```


Donde `numberOfReservations` es la cantidad de registros que va a realizar, `numberOfRooms` es el número de cuartos que tiene el hotel, y `noOfDaysForward` es la cantidad de días que tiene como máximo para establecer `endDates` (a partir del día de ejecución).

Si decide cambiar `numberOfRoom` aquí, recomendaría ampliamente cambiarlo en la configuración del servidor de *sails*, ésta es una variable global que puede modificar en el archivo `config/custom.js`.


## Endpoints

Para utilizar este servidor, los principales endpoints de interacción son:

**NOTA:** Todas las fechas pueden ser introducidas en cualquier formato de string que pueda ser parseado por dayjs.


### `GET /reservations`

Este endpoint regresa las reservaciones que se tienen en la base de datos.

Dado que es una request de tipo `GET`, no fue posible recuperar algún `body`, sin embargo, es posible incorporar algunos `queryParams` para obtener algunas cosas específicas.

- id: Este ID puede ser shortID o el ID de Mongo, regresa solo una entrada (si es que existe), si se omite, regresa una lista.
- orderStatus: Este parametro puede ser `all`, `active` o `cancelled`. Regresa las reservaciones que tienen el estatus indicado por el parametro (exceptuando `all`). Por defecto, regresa solo reservaciones que se encuentran con estatus `active`, principalmente existe para poder regresar todas las reservaciones (una vez pasandole `all`).
- sortStart: Es un booleano, de ser verdadero, ordena los resultados por la fecha de inicio de la reservación, por defecto es falso.


### `POST /reservations`

En este endpoint se crean reservaciones. Las entradas son las siguientes

- clientName: Un string para identificar al cliente.
- startDate: la fecha de inicio de la reservación.
- endDate: la fecha de terminación de la reservación.

En caso de no tener un cuarto disponible, regresa un mensaje indicandolo, y la reservación no se crea.


### `DELETE /reservations`

En este endpoint se borran/cancelan reservaciones.

- id: El MongoID o reservationID (el shortId que genera nanoid) de la orden que quieres cancelar o borrar.
- keep: Un booleano, si pasas este parametro como verdadero, la reservación no es eliminada de la base de datos, si no que su status cambia a `cancelled`, para todo fin práctico, la reservación deja de existir (a menos de que busques específicamente las órdenes canceladas), ya que no afecta para la creación de nuevas. Por defecto, es falso, es decir si solo se manda el `id`, el documento en la base de datos se elimina.


### `POST /availability`

En éste endpoint, podemos "utilizar" *la función*, si mandamos

- startDate, endDate

Nos regresa un arreglo de números, que representa los números de los cuartos en los que, si un cliente quisiera reservar en las fechas específicadas, podría reservar sin problema.




