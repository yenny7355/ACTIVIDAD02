// Variables globales para la base de datos y la tabla DataTable
let DB;
let tabla;

// Función principal autoejecutable
(function(){

    // Cuando el documento esté listo
    $(document).ready( function () {

        // Crear y conectar a la base de datos
        crearDB();
        conectarDB();

        // Si la base de datos 'crm' ya está abierta
        if(window.indexedDB.open('crm',1)){
            // Obtener los clientes y mostrarlos en la tabla
            obtenerClientes();
        }
    });

    // Función para conectar a la base de datos
    function conectarDB(){
        const abrirConexion = window.indexedDB.open('crm', 1);

        // En caso de error en la conexión
        abrirConexion.onerror = function(e){
            console.log('Hubo error');
        }

        // Cuando la conexión es exitosa
        abrirConexion.onsuccess = function(){
            DB = abrirConexion.result; // Almacenar la base de datos en la variable global
        }
    }

    // Función para crear la base de datos y definir la estructura
    function crearDB(){
        const crearDB = window.indexedDB.open('crm',1);

        // En caso de error al crear la base de datos
        crearDB.onerror = function(){
            console.log('Hubo un error');
        }

        // Cuando la base de datos es creada exitosamente
        crearDB.onsuccess = function(){
            DB = crearDB.result; // Almacenar la base de datos en la variable global
        }

        // Cuando se necesita actualizar la base de datos (primera vez que se crea)
        crearDB.onupgradeneeded = function(e){
            const db = e.target.result;

            // Crear un almacén de objetos llamado 'crm' con un ID autoincrementable
            const objectStore = db.createObjectStore('crm',{keyPath:'id', autoIncrement:true});

            // Crear índices para facilitar las búsquedas por nombre, email, telefono, empresa e id
            objectStore.createIndex('nombre','nombre',{unique:false});
            objectStore.createIndex('email','email',{unique:true});
            objectStore.createIndex('telefono','telefono',{unique:false});
            objectStore.createIndex('empresa','empresa',{unique:false});
            objectStore.createIndex('id','id',{unique:true});

            console.log('DB Lista y Creada');
        }
    }

    // Función para obtener los clientes de la base de datos y mostrarlos en la tabla
    function obtenerClientes() {
        const abrirConexion = window.indexedDB.open('crm',1);

        // En caso de error al abrir la conexión
        abrirConexion.onerror = function() {
            console.log('Hubo error');
        }

        // Cuando la conexión es exitosa
        abrirConexion.onsuccess = function(){
            DB = abrirConexion.result; // Almacenar la base de datos en la variable global
            let cliente = [];
            const objectStore = DB.transaction('crm').objectStore('crm');

            // Abrir un cursor para recorrer los clientes en el almacén de objetos
            objectStore.openCursor().onsuccess = function(e){
                const cursor = e.target.result;
                if(cursor){
                    // Obtener los datos de cada cliente y agregarlos a un arreglo
                    const {nombre,email, telefono, empresa, id} = cursor.value;
                    cliente.push({nombre,email, telefono,empresa,id});
                    cursor.continue();
                }
                else{
                    // Cuando se han obtenido todos los clientes, mapear los datos para la tabla DataTable
                    var nuevoArreglo = cliente.map(function(o) {
                        return Object.keys(o).reduce(function(array, key) {
                            return array.concat([o[key]]);
                        }, []);
                    });

                    // Inicializar la tabla DataTable con los datos de los clientes
                    tabla = $('#myTable').DataTable( {
                        "lengthMenu": [ 5, 10,15,20, 50, 100 ],
                        "destroy":true,
                         "language": {
                            "lengthMenu": "Mostrar _MENU_ registros por página",
                            "zeroRecords": "No hay clientes registrados",
                            "info": "Página _PAGE_ de _PAGES_",
                            "infoEmpty": "Cero regisros",
                            "paginate": {
                                "first":      "Primero",
                                "last":       "Ultimo",
                                "next":       "Siguiente",
                                "previous":   "Anterior"
                            },
                            "search":         "Buscar:",
                            "infoFiltered": "(filtered from _MAX_ total records)"
                            },
                        data: nuevoArreglo,
                        columns: [
                            { nombre: "nombre",
                                "render": function(data,type,row,meta){
                                    // Renderizar el nombre del cliente en negrita y mostrar el email debajo
                                    let nombre = `<p class="text-sm leading-5 font-medium text-gray-700 text-lg font-bold">${data}</p>`;
                                    let email =  `<p class="text-sm leading-10 font-medium text-gray-700">${row[1]}</p>`;
                                    return nombre + email;
                                }
                            },
                            { telefono: "",
                                "render": function(data,type,row,meta){
                                    // Renderizar el teléfono del cliente
                                    return `<p class="text-gray-700">${row[2]}</p>`;
                                }   
                             },
                            { empresa: "",
                                "render": function(data,type,row,meta){
                                    // Renderizar el nombre de la empresa del cliente
                                    return `<p class="text-gray-700">${row[3]}</p>`;
                                }  
                            },
                            { opciones: "",
                                "render": function(data,type,row,meta){
                                    // Renderizar botones de editar y eliminar para cada cliente
                                    let editar = `<a href="editar-cliente.html?id=${row[4]}"><button class="btn btn-info border-0">Editar</button></a>`;
                                    let eliminar = ` <a><button onclick="eliminar(event,${row[4]})" data-cliente="${row[4]}" class="btn btn-danger border-0">Eliminar</button></a>`;
                                    return editar+eliminar;
                                }
                            }
                        ]
                    } );
                }
            }
        }
    }

})();

// Función para eliminar un cliente
function eliminar(event,idEliminar){

    // Mostrar un mensaje de confirmación antes de eliminar al cliente
    Swal.fire({
        title: "¿Está seguro que desea eliminar al cliente?",
        type: "question",
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#319795',
        cancelButtonColor: '#d33',
      })
      .then((result) => {
        if (result.value) {
            // Iniciar una transacción para eliminar al cliente de la base de datos
            const transaction = DB.transaction(['crm'], 'readwrite');
            const objectStore = transaction.objectStore('crm');
         
            objectStore.delete(idEliminar); // Eliminar al cliente

            // Cuando la transacción se completa exitosamente
            transaction.oncomplete = function(){
                // Mostrar mensaje de éxito y eliminar la fila correspondiente de la tabla
                Swal.fire(
                    'El cliente ha sido eliminado',
                    '',
                    'success'
                ).then(()=> {
                    event.target.parentElement.parentElement.parentElement.remove();
                });
            }

            // En caso de error en la transacción
            transaction.onerror = function(){
                console.log('Hubo un error');
            }
        }
    });

}
