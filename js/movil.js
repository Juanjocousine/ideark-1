// Icono de abrir y cerrar el menu, y cierre con Escape o al tocar fuera
(function(){
  var menu=document.getElementById('navLinks');var boton=document.getElementById('hamburger');
  if(!menu||!boton)return;
  function pintar(){var abierto=menu.classList.contains('open');
    document.documentElement.classList.toggle('menu-abierto',abierto);
    boton.innerHTML=abierto?'<i class="fas fa-times"></i>':'<i class="fas fa-bars"></i>';
    boton.setAttribute('aria-label',abierto?'Cerrar menú':'Abrir menú');boton.setAttribute('aria-expanded',abierto)}
  new MutationObserver(pintar).observe(menu,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&menu.classList.contains('open')){menu.classList.remove('open')}});
  menu.addEventListener('click',function(e){if(e.target===menu)menu.classList.remove('open')});
  pintar();
})();
