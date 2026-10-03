/* Configuración del chatbot para ideark.es (agencia web).
   Sin EmailJS: el aviso llega por Netlify Forms (formulario "chatbot") a info@ideark.es.
   Precios: solo los planes que ya publica la propia web. */
window.CHATBOT_OFICIO = {
    marca: 'Ideark',
    oficio: 'web',
    origen: 'ideark.es',
    titulo: 'Asistente Ideark',
    telefono: '+34611661557',
    telefonoVisible: '611 661 557',
    whatsapp: '34611661557',
    privacidadUrl: 'ideark.es/privacidad',
    bienvenida: 'Hola 👋 Te ayudo a pedir presupuesto para la web o el Google de tu negocio. ¿Qué necesitas?',
    notaPrecio: 'El precio final te lo confirmamos antes de empezar, según lo que necesite tu negocio.',
    emailjs: null,
    textos: {
        zona: '📍 ¿En qué *ciudad* está tu negocio?',
        telefono: '📱 ¿Tu *teléfono* o WhatsApp? Te escribimos para preparar el presupuesto.',
        consentimiento: 'Último paso. Usaremos tus datos solo para preparar tu presupuesto y contactarte.',
        recibido: '✅ *Solicitud recibida.* Te contactamos en breve',
        waSinServicio: 'Quiero presupuesto para la web de mi negocio.'
    },
    zonas: ['Sagunto', 'Valencia', 'Castellón', 'Paterna', 'Torrent', 'Gandia', 'Alzira', 'Xàtiva', 'Cullera', 'Llíria', 'Ontinyent', 'Vila-real', 'Borriana', 'Vinaròs'],
    servicios: [
        { nombre: 'Una web para mi negocio', precio: 'Plan Web 399 € · PRO 890 € + 149 €/mes · Premium 1.499 € + 199 €/mes', preguntas: [
            { texto: '¿A qué se dedica tu negocio?', botones: ['Oficio / reformas', 'Restaurante / bar', 'Clínica / salud', 'Comercio', 'Otro'] },
            { texto: '¿Tienes web ahora?', botones: ['No', 'Sí, pero anticuada', 'Sí'] },
            { texto: '¿Qué plan te encaja?', botones: ['Plan Web', 'Plan PRO', 'Premium', 'Aún no lo sé'] }
        ]},
        { nombre: 'Aparecer en Google (SEO local)', preguntas: [
            { texto: '¿Tienes ficha de Google Business?', botones: ['Sí', 'No', 'No lo sé'] },
            { texto: '¿Tienes web?', botones: ['Sí', 'No'] }
        ]},
        { nombre: 'Chatbot o automatización', preguntas: [
            { texto: '¿Qué quieres automatizar?', botones: ['Responder WhatsApp', 'Pedir citas', 'Presupuestos', 'Otra cosa'] }
        ]},
        { nombre: 'Arreglar o renovar mi web', preguntas: [
            { texto: '¿Qué le pasa?', botones: ['Se ve antigua', 'No sale en Google', 'No llegan contactos', 'Otra cosa'] }
        ]}
    ]
};
