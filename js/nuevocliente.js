(function(){

    // Variable para almacenar la base de datos
    let DB;

    // Cuando el documento esté listo
    $(document).ready( function () {

        // Conectar a la base de datos
        conectarDB();
        
        // Cuando se envía el formulario, llamar a la función para validar el cliente
        $("#formulario").submit(validarCliente);

    });

    // Función para conectar a la base de datos
    function conectarDB(){
        // Abrir una conexión a la base de datos 'crm' en la versión 1
        const abrirConexion = window.indexedDB.open('crm', 1);

        // Si hay un error en la conexión
        abrirConexion.onerror = function(e){
            console.log('Hubo error');
        }

        // Cuando la conexión es exitosa
        abrirConexion.onsuccess = function(){
            // Almacenar la base de datos
            DB = abrirConexion.result;
        }
    }

    // Función para validar el cliente
    function validarCliente(e){
        // Prevenir el envío del formulario
        e.preventDefault();
        
        // Obtener los valores del formulario
        const nombre = $("#nombre").val();
        const email = $("#email").val();
        const telefono = $("#telefono").val();
        const empresa = $("#empresa").val();

        // Si algún campo está vacío
        if(nombre === '' || email === '' || telefono === '' || empresa === ''){
            // Mostrar mensaje de error
            Swal.fire(
                'Todos los campos son obligatorios',
                '',
                'error'
            )
        }
        else{
            // Crear un objeto cliente con los datos del formulario
            const cliente = {
                nombre,
                email,
                telefono,
                empresa
            }

            // Asignar un ID único al cliente (en este caso, la marca de tiempo actual)
            cliente.id = Date.now();

            // Llamar a la función para crear un nuevo cliente
            crearNuevoCliente(cliente);
        }
    }

    // Función para crear un nuevo cliente en la base de datos
    function crearNuevoCliente(cliente){

        // Iniciar una transacción en la base de datos para agregar el cliente
        const transaction = DB.transaction('crm','readwrite');

        // Obtener el almacenamiento de objetos 'crm'
        const objectStore = transaction.objectStore('crm');

        // Agregar el cliente al almacenamiento de objetos
        objectStore.add(cliente);

        // Si hay un error en la transacción
        transaction.onerror = function(e){
            // Mostrar mensaje de error
            Swal.fire(
                'Hubo un error al crear el registro',
                '',
                'error'
            )
        }

        // Cuando la transacción se completa exitosamente
        transaction.oncomplete = function(){
            // Mostrar mensaje de éxito
            Swal.fire(
                'El cliente ha sido creado',
                '',
                'success'
            ).then(()=> window.location.href= 'index.html'); // Redirigir al usuario a la página principal
        }
    }

})();
