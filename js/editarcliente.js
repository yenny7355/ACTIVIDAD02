(function(){
    // Variables globales
    let DB; // Variable para la base de datos
    let idCliente; // Variable para almacenar el ID del cliente a editar

    // Cuando el documento esté listo
    $(document).ready(function () {
        
        // Conectar a la base de datos
        conectarDB();

        // Cuando se envía el formulario, llamar a la función para actualizar el cliente
        $("#formulario").submit(actualizarCliente);

        // Obtener el ID del cliente de la URL si está presente
        const parametrosURL = new URLSearchParams(window.location.search);
        idCliente = parametrosURL.get('id');

        // Si hay un ID de cliente en la URL
        if(idCliente){
            // Esperar un breve período antes de obtener el cliente para asegurar que la conexión a la base de datos esté lista
            setTimeout(() => {
                obtenerCliente(idCliente);
            }, 50);
        }
    });

    // Función para actualizar el cliente
    function actualizarCliente(e) {
        // Prevenir el envío del formulario
        e.preventDefault();

        // Verificar que todos los campos del formulario estén completos
        if($("#nombre").val() === '' ||
           $("#email").val() === '' ||
           $("#telefono").val() === '' ||
           $("#empresa").val() === ''){

            // Mostrar mensaje de error si algún campo está vacío
            Swal.fire(
                'Todos los campos son obligatorios',
                '',
                'error'
            )
        }
        else{
            // Crear objeto con los datos actualizados del cliente
            const clienteActualizado = {
                nombre: $("#nombre").val(),
                email: $("#email").val(),
                telefono: $("#telefono").val(),
                empresa: $("#empresa").val(),
                id: Number(idCliente) // Convertir el ID a número
            }

            // Iniciar una transacción para actualizar el cliente en la base de datos
            const transaction = DB.transaction(['crm'],'readwrite');
            const objectStore = transaction.objectStore('crm');
            objectStore.put(clienteActualizado); // Actualizar el cliente

            // Cuando la transacción se completa exitosamente
            transaction.oncomplete = function(){
                // Mostrar mensaje de éxito y redirigir al usuario a la página principal
                Swal.fire(
                    'El cliente ha sido editado',
                    '',
                    'success'
                ).then(()=> window.location.href= 'index.html');
            }

            // Cuando hay un error en la transacción
            transaction.onerror = function(){
                console.log('Hubo un error');
            }
        }
    }

    // Función para obtener los datos del cliente a partir de su ID
    function obtenerCliente(id){
        const transaction = DB.transaction(['crm'],'readwrite');
        const objectStore = transaction.objectStore('crm');

        // Obtener un cursor para recorrer los clientes en el almacenamiento de objetos
        const cliente = objectStore.openCursor();

        // Cuando se obtiene el cursor
        cliente.onsuccess = function(e){
            const cursor = e.target.result;
            if(cursor){
                // Si se encuentra el cliente con el ID correspondiente
                if(cursor.value.id === Number(id)){
                    // Llenar el formulario con los datos del cliente encontrado
                    llenarFormulario(cursor.value);
                }
                cursor.continue(); // Seguir buscando más clientes
            }
        }
    }

    // Función para llenar el formulario con los datos del cliente
    function llenarFormulario(datosCliente){
        // Asignar los valores del cliente a los campos del formulario
        $("#nombre").val(datosCliente.nombre);
        $("#email").val(datosCliente.email);
        $("#telefono").val(datosCliente.telefono);
        $("#empresa").val(datosCliente.empresa);
    }

    // Función para conectar a la base de datos
    function conectarDB(){
        const abrirConexion = window.indexedDB.open('crm', 1);

        // Si hay un error al abrir la conexión
        abrirConexion.onerror = function(e){
            console.log('Hubo error');
        }

        // Cuando la conexión es exitosa
        abrirConexion.onsuccess = function(){
            DB = abrirConexion.result; // Almacenar la base de datos en la variable global
        }
    }

})();
