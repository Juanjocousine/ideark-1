/* =====================================================================
   CHATBOT OFICIO — módulo común para las webs satélite
   Uso: definir window.CHATBOT_OFICIO (ver chatbot-config-*.js) y cargar
   este archivo con <script src="/js/chatbot-oficio.js" defer></script>.
   - Inyecta su propio HTML (no hay que tocar las páginas salvo los <script>).
   - Estilos propios en /css/chatbot-oficio.css (prefijo cbo-). NO usa site.css.
   - Envía el aviso por 3 vías: Netlify Forms (copia de seguridad),
     EmailJS (aviso a info@) y WhatsApp (botón final, a elección del cliente).
   ===================================================================== */
(function () {
    'use strict';
    var C = window.CHATBOT_OFICIO;
    if (!C || document.getElementById('cboButton')) return;

    var EMAILJS = C.emailjs || null; // {publicKey, serviceId, templateAdmin, templateCliente}
    var estado = { paso: 'inicio', servicio: null, respuestas: [], zona: '', nombre: '', telefono: '', email: '' };

    function track(evento, extra) {
        try { if (typeof window.gtag === 'function') window.gtag('event', evento, Object.assign({ origen: C.origen }, extra || {})); } catch (e) {}
    }

    /* ---------- DOM ---------- */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'cboButton';
    btn.className = 'cbo-button';
    btn.setAttribute('aria-label', 'Abrir asistente de ' + C.oficio);
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/></svg>';

    var win = document.createElement('div');
    win.id = 'cboWindow';
    win.className = 'cbo-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Asistente ' + C.marca);
    win.innerHTML =
        '<div class="cbo-header"><strong>' + esc(C.titulo || ('Asistente ' + C.marca)) + '</strong>' +
        '<button type="button" class="cbo-close" aria-label="Cerrar">×</button></div>' +
        '<div class="cbo-messages" aria-live="polite"></div>' +
        '<form class="cbo-input" autocomplete="on"><input type="text" placeholder="Escribe aquí..." aria-label="Mensaje">' +
        '<button type="submit" aria-label="Enviar">➤</button></form>';

    document.body.appendChild(btn);
    document.body.appendChild(win);

    var msgs = win.querySelector('.cbo-messages');
    var form = win.querySelector('.cbo-input');
    var input = form.querySelector('input');

    function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
    function fmt(t) { return esc(t).replace(/\*(.+?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }

    function decir(texto, botones, esUsuario) {
        var div = document.createElement('div');
        div.className = 'cbo-msg ' + (esUsuario ? 'cbo-user' : 'cbo-bot');
        var b = document.createElement('div');
        b.className = 'cbo-bubble';
        b.innerHTML = fmt(texto);
        div.appendChild(b);
        if (botones && botones.length) {
            var cont = document.createElement('div');
            cont.className = 'cbo-options';
            botones.forEach(function (op) {
                var x = document.createElement('button');
                x.type = 'button';
                x.className = 'cbo-option';
                x.textContent = op;
                x.addEventListener('click', function () { cont.remove(); procesar(op); });
                cont.appendChild(x);
            });
            div.appendChild(cont);
        }
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }

    var TX = C.textos || {};
    function T(k, def) { return TX[k] || def; }
    var HUMANO = T('humano', '📞 Hablar con una persona');

    function bienvenida() {
        decir(C.bienvenida || ('Hola, soy el asistente de ' + C.marca + '. ¿Qué necesitas?'),
            C.servicios.map(function (s) { return s.nombre; }).concat([HUMANO]));
        estado.paso = 'servicio';
    }

    function preguntaActual() {
        return estado.servicio.preguntas[estado.respuestas.length];
    }

    function siguientePregunta() {
        var p = preguntaActual();
        if (p) { decir(p.texto, p.botones); estado.paso = 'pregunta'; return; }
        decir(T('zona', '📍 ¿En qué *población* es el trabajo?'), (C.zonas || []).concat(['Otra']));
        estado.paso = 'zona';
    }

    function resumenTexto() {
        var s = estado.servicio;
        var l = ['Servicio: ' + s.nombre];
        s.preguntas.forEach(function (p, i) { l.push(p.texto + ' ' + estado.respuestas[i]); });
        l.push('Zona: ' + estado.zona);
        return l.join('\n');
    }

    function telefonoValido(t) {
        var d = t.replace(/[\s.\-()]/g, '').replace(/^(\+34|0034)/, '');
        if (/^[6789]\d{8}$/.test(d)) return true;
        // Números extranjeros (huéspedes, propietarios de fuera): solo si la config lo permite
        return !!C.telefonoInternacional && /^(\+|00)\d{8,15}$/.test(d);
    }

    function procesar(texto) {
        texto = String(texto || '').trim();
        if (!texto) return;
        decir(texto, null, true);
        input.value = '';

        switch (estado.paso) {
            case 'inicio':
                bienvenida(); return;

            case 'servicio':
                if (texto === HUMANO) {
                    decir(T('humanoTexto', 'Llámanos al *' + C.telefonoVisible + '* o escríbenos por WhatsApp y te atendemos.'), ['Llamar', 'WhatsApp']);
                    estado.paso = 'humano'; return;
                }
                var s = C.servicios.filter(function (x) { return x.nombre === texto; })[0];
                if (!s) { decir('Elige una de las opciones, por favor.', C.servicios.map(function (x) { return x.nombre; }).concat([HUMANO])); return; }
                estado.servicio = s; estado.respuestas = [];
                track('chatbot_servicio', { servicio: s.nombre });
                if (s.precio) decir('💡 Estimación: *' + s.precio + '*.' + (C.notaPrecio ? '\n' + C.notaPrecio : ''));
                siguientePregunta(); return;

            case 'pregunta':
                estado.respuestas.push(texto);
                siguientePregunta(); return;

            case 'zona':
                if (texto === 'Otra') { decir('¿Qué población?'); estado.paso = 'zona_libre'; return; }
                estado.zona = texto; pedirNombre(); return;

            case 'zona_libre':
                estado.zona = texto; pedirNombre(); return;

            case 'nombre':
                estado.nombre = texto;
                decir(T('telefono', '📱 ¿Tu *teléfono*? Te llamará o escribirá el profesional.'));
                estado.paso = 'telefono'; return;

            case 'telefono':
                if (!telefonoValido(texto)) { decir(C.telefonoInternacional ? 'Ese número no parece correcto. Escribe un número español de 9 cifras o uno extranjero con prefijo (+49…).' : 'Ese número no parece correcto. Escribe un móvil o fijo de 9 cifras.'); return; }
                estado.telefono = texto;
                decir(T('email', EMAILJS ? '📧 ¿Quieres dejar tu *email* para recibir una copia? (opcional)' : '📧 ¿Quieres dejar también tu *email*? (opcional)'), ['Saltar']);
                estado.paso = 'email'; return;

            case 'email':
                estado.email = (texto === 'Saltar' || texto.indexOf('@') < 0) ? '' : texto;
                decir(T('consentimiento', 'Último paso. Para atenderte pasamos tus datos al profesional de ' + C.oficio +
                    ' de tu zona.') + ' Más info en ' + (C.privacidadUrl || '/privacidad') + '.\n\n¿Nos autorizas?',
                    ['✅ Sí, autorizo', '❌ No autorizo']);
                estado.paso = 'consentimiento'; return;

            case 'consentimiento':
                if (texto !== '✅ Sí, autorizo') {
                    estado = { paso: 'fin', servicio: null, respuestas: [], zona: '', nombre: '', telefono: '', email: '' };
                    decir('Entendido, no enviamos nada. Si prefieres, llámanos al *' + C.telefonoVisible + '*.');
                    return;
                }
                enviar();
                return;

            case 'humano':
            case 'fin_wa':
                if (texto === 'Llamar') { track('click_llamar', { desde: 'chatbot' }); window.location.href = 'tel:' + C.telefono; return; }
                if (texto === 'WhatsApp') { abrirWhatsApp(); return; }
                return;

            default:
                return;
        }
    }

    function pedirNombre() {
        decir('📝 ¿Cómo te llamas?');
        estado.paso = 'nombre';
    }

    function waTexto() {
        return 'Hola, vengo de ' + C.origen + '. Soy ' + estado.nombre + '.\n' + (estado.servicio ? resumenTexto() : T('waSinServicio', 'Necesito presupuesto de ' + C.oficio + '.'));
    }

    function abrirWhatsApp() {
        track('click_whatsapp', { desde: 'chatbot' });
        window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(waTexto()), '_blank', 'noopener');
    }

    function enviar() {
        var fecha = new Date().toLocaleString('es-ES');
        var datos = {
            'form-name': 'chatbot',
            origen: C.origen,
            servicio: estado.servicio.nombre,
            detalles: resumenTexto(),
            zona: estado.zona,
            nombre: estado.nombre,
            telefono: estado.telefono,
            email: estado.email,
            consentimiento: 'Sí, otorgado en el chat el ' + fecha
        };

        // 1) Copia en Netlify Forms (requiere el <form name="chatbot" hidden> en el HTML)
        try {
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(datos).toString(),
                keepalive: true
            }).catch(function () {});
        } catch (e) {}

        // 2) Aviso por EmailJS (mismo servicio que Multiservicios)
        if (EMAILJS) cargarEmailJS(function () {
            try {
                window.emailjs.init(EMAILJS.publicKey);
                window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateAdmin, {
                    nombre: datos.nombre, email: datos.email, telefono: datos.telefono,
                    poblacion: datos.zona, servicio: '[' + C.origen + '] ' + datos.servicio,
                    detalles: datos.detalles, presupuesto: estado.servicio.precio || 'A valorar',
                    fecha: fecha, consentimiento: datos.consentimiento,
                    origen: C.origen, marca: C.marca, oficio: C.oficio
                }).catch(function () {});
                if (datos.email && EMAILJS.templateCliente) {
                    window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateCliente, {
                        nombre: datos.nombre, email: datos.email, servicio: datos.servicio,
                        detalles: datos.detalles, presupuesto: estado.servicio.precio || 'A valorar', fecha: fecha,
                        telefono: datos.telefono, poblacion: datos.zona,
                        origen: C.origen, marca: C.marca, oficio: C.oficio
                    }).catch(function () {});
                }
            } catch (e) {}
        });

        track('generate_lead', { metodo: 'chatbot', servicio: datos.servicio, zona: datos.zona });
        decir(T('recibido', '✅ *Aviso recibido.* Te contactamos en breve') + ' al ' + estado.telefono + '.\n\n¿Quieres adelantarlo por WhatsApp?', ['WhatsApp', 'Llamar']);
        estado.paso = 'fin_wa';
    }

    function cargarEmailJS(cb) {
        if (window.emailjs) return cb();
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = cb;
        document.head.appendChild(s);
    }

    /* ---------- Eventos ---------- */
    btn.addEventListener('click', function () {
        var abierto = win.classList.toggle('cbo-open');
        if (abierto) {
            track('chatbot_open');
            if (estado.paso === 'inicio') setTimeout(bienvenida, 250);
            setTimeout(function () { input.focus(); }, 300);
        }
    });
    win.querySelector('.cbo-close').addEventListener('click', function () { win.classList.remove('cbo-open'); });
    form.addEventListener('submit', function (e) { e.preventDefault(); procesar(input.value); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') win.classList.remove('cbo-open'); });
})();
