'use strict';

/* ═══════════════════════════════════════════════════════════════
   CONFIG — edit these constants to customise the survey
   ═══════════════════════════════════════════════════════════════ */

const QUESTION_TEXT = 'Насколько вам всё понравилось?';

const RATINGS = [
  { value: 1, emoji: '😞', label: 'Ужасно' },
  { value: 2, emoji: '🙁', label: 'Плохо' },
  { value: 3, emoji: '😐', label: 'Нормально' },
  { value: 4, emoji: '🙂', label: 'Хорошо' },
  { value: 5, emoji: '🤩', label: 'Отлично' },
];

/* ═══════════════════════════════════════════════════════════════
   INTEGRATION POINT — replace this stub with your backend call.

   `rating`    — number 1–5 chosen by the user
   `initData`  — raw URL-encoded string from MAX Bridge that you
                 must forward to your server for validation and
                 to extract user / chat identifiers.

   Example backend call:
     await fetch('https://your-backend.example/csat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ rating, initData }),
     });

   Your backend then:
     1. Validates initData (see https://dev.max.ru/docs/webapps/validation)
     2. Extracts user.id / chat.id / start_param
     3. Sends a callback / message to the bot via MAX Bot API
   ═══════════════════════════════════════════════════════════════ */
async function sendRating(rating, initData) {
  // TODO: implement your backend call here
  console.log('[CSAT] rating =', rating, '| initData =', initData);
}

/* ═══════════════════════════════════════════════════════════════
   MAX BRIDGE ACCESSOR — safe wrapper with fallback for local dev
   ═══════════════════════════════════════════════════════════════ */
function getWebApp() {
  return window.WebApp ?? null;
}

/* ═══════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════ */
(function init() {
  const webApp = getWebApp();

  /* — Greeting — */
  const greetingEl = document.getElementById('greeting');
  const user = webApp?.initDataUnsafe?.user;
  if (user?.first_name) {
    greetingEl.textContent = `Привет, ${user.first_name}!`;
  }

  /* — Update question text (from constant) — */
  const questionEl = document.querySelector('.question');
  if (questionEl) questionEl.textContent = QUESTION_TEXT;

  /* — Render rating buttons — */
  const ratingsEl = document.getElementById('ratings');
  RATINGS.forEach(({ value, emoji, label }) => {
    const btn = document.createElement('button');
    btn.className = 'rating-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', `${label} (${value} из ${RATINGS.length})`);
    btn.dataset.value = value;
    btn.innerHTML = `
      <span class="emoji" aria-hidden="true">${emoji}</span>
      <span class="label">${label}</span>
    `;
    ratingsEl.appendChild(btn);
  });

  /* — Click handling — */
  let answered = false;

  ratingsEl.addEventListener('click', async (e) => {
    if (answered) return;

    const btn = e.target.closest('.rating-btn');
    if (!btn) return;

    answered = true;

    const ratingValue = Number(btn.dataset.value);
    const ratingData = RATINGS.find(r => r.value === ratingValue);

    /* Visual feedback */
    ratingsEl.classList.add('has-selection');
    btn.classList.add('is-selected');

    /* Haptic feedback (mobile only, graceful no-op on desktop/web) */
    webApp?.HapticFeedback?.impactOccurred('light').catch(() => {});

    /* Send rating to your backend */
    try {
      await sendRating(ratingValue, webApp?.initData ?? '');
    } catch (err) {
      console.error('[CSAT] sendRating failed:', err);
    }

    /* Transition to thanks screen after a short pause */
    setTimeout(() => showThanks(ratingData), 350);
  });

  /* — Thanks screen — */
  function showThanks(ratingData) {
    const screenQuestion = document.getElementById('screenQuestion');
    const screenThanks = document.getElementById('screenThanks');
    const thanksEmoji = document.getElementById('thanksEmoji');

    thanksEmoji.textContent = ratingData?.emoji ?? '🙂';

    screenQuestion.classList.add('fade-out');
    screenQuestion.addEventListener('animationend', () => {
      screenQuestion.hidden = true;
      screenThanks.hidden = false;
    }, { once: true });

    /* Auto-close after 1.5 s */
    setTimeout(() => {
      try { webApp?.close?.(); } catch (_) {}
    }, 1500);
  }
})();
