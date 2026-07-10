/* =========================================================
   IMPULSO — script.js (formulario de inicio)
   1) Navegación entre los 5 pasos, con validación por paso.
   2) Actualiza el indicador de progreso.
   3) Envía los datos a un Webhook de Make.com (o el destino
      que definas) y muestra la tarjeta de éxito.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* =======================================================
     CONFIGURACIÓN — reemplazá esta URL por el webhook real
     del escenario de Make que recibe el formulario.
     (Make: módulo "Webhooks > Custom webhook" → copiá la URL
     y armá los módulos siguientes para escribir en Sheets,
     notificarte por email o WhatsApp, etc.)
     ======================================================= */
  var WEBHOOK_URL = 'https://us2.make.com/1406605/scenarios/5622489/edit';

  var form = document.getElementById('intake-form');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.form-step'));
  var progressSteps = Array.prototype.slice.call(document.querySelectorAll('.progress-step'));
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var btnSubmit = document.getElementById('btn-submit');
  var statusEl = document.getElementById('form-status');
  var successCard = document.getElementById('success-card');

  var currentStep = 0;

  function updateProgress() {
    progressSteps.forEach(function (el, i) {
      el.classList.toggle('is-active', i === currentStep);
      el.classList.toggle('is-complete', i < currentStep);
    });
    statusEl.textContent = 'Paso ' + (currentStep + 1) + ' de ' + steps.length;
    btnPrev.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    var isLast = currentStep === steps.length - 1;
    btnNext.hidden = isLast;
    btnSubmit.hidden = !isLast;
  }

  function showStep(index) {
    steps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === index);
    });
    updateProgress();
  }

  function stepIsValid(index) {
    var step = steps[index];
    var fields = step.querySelectorAll('input, select, textarea');
    var valid = true;
    fields.forEach(function (field) {
      if (!field.checkValidity()) {
        valid = false;
      }
    });
    if (!valid) {
      step.reportValidity ? step.reportValidity() : form.reportValidity();
    }
    return valid;
  }

  btnNext.addEventListener('click', function () {
    if (!stepIsValid(currentStep)) return;
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
      window.scrollTo({ top: form.offsetTop - 24, behavior: 'smooth' });
    }
  });

  btnPrev.addEventListener('click', function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
      window.scrollTo({ top: form.offsetTop - 24, behavior: 'smooth' });
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!stepIsValid(currentStep)) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enviando...';

    var data = Object.fromEntries(new FormData(form).entries());

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function () {
        form.hidden = true;
        document.querySelector('.progress-track').hidden = true;
        successCard.hidden = false;
        successCard.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(function () {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Enviar y agendar arranque';
        statusEl.textContent = 'No pudimos enviar el formulario. Probá de nuevo o escribinos por WhatsApp.';
      });
  });

  showStep(currentStep);
});