(() => {
  const config = window.birthdayConfig;
  const root = document.documentElement;
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const progressNote = document.querySelector('#progress-note');
  const sparkleField = document.querySelector('#sparkle-field');
  const soundToggle = document.querySelector('#sound-toggle');
  const soundLabel = document.querySelector('.sound-label');
  const sceneLabels = ['A little surprise', 'A little question', 'Make a wish', 'A little note', 'The good stuff', 'A little gift', 'Just for you'];
  let currentScene = 0;
  let noAttempts = 0;
  let candlesOut = 0;
  let galleryIndex = 0;
  let audioContext;
  let soundOn = false;

  const q = (selector, parent = document) => parent.querySelector(selector);
  const qa = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const setText = (selector, value) => qa(selector).forEach((node) => { node.textContent = value; });

  function applyConfig() {
    const palette = config.themeColors?.[config.theme] || config.themeColors.blush;
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-deep', palette.accentDeep);
    root.style.setProperty('--glow', palette.glow);
    setText('[data-brand]', config.brand);
    setText('[data-recipient]', config.recipientName);
    setText('[data-sender]', config.senderName);
    setText('[data-gift-message]', config.giftMessage);
    setText('[data-final-message]', config.finalMessage);
    setText('#animated-message', config.birthdayMessage);
    if (!config.enableMusic) soundToggle.hidden = true;
    if (!config.enableGallery || config.sections?.gallery === false) {
      scenes.find((scene) => scene.dataset.scene === '4')?.remove();
    }
    if (!config.enableGift || config.sections?.gift === false) {
      scenes.find((scene) => scene.dataset.scene === '5')?.remove();
    }
    if (config.sections?.message === false) {
      scenes.find((scene) => scene.dataset.scene === '3')?.remove();
    }
    renderGallery();
  }

  function createSparkles() {
    const sparkleCharacters = ['✦', '✧', '·', '✦', '⋆', '·', '✧', '✦'];
    sparkleCharacters.forEach((character, index) => {
      const span = document.createElement('span');
      span.textContent = character;
      span.style.left = `${8 + ((index * 17) % 87)}%`;
      span.style.top = `${13 + ((index * 29) % 70)}%`;
      span.style.fontSize = `${9 + (index % 3) * 5}px`;
      span.style.animationDelay = `${index * -0.55}s`;
      sparkleField.append(span);
    });
  }

  function updateProgress() {
    const activeScenes = qa('.scene');
    const index = Math.max(0, activeScenes.findIndex((scene) => scene.classList.contains('is-active')));
    progressNote.textContent = `${sceneLabels[currentScene] || 'A little surprise'} · ${String(index + 1).padStart(2, '0')} / ${String(activeScenes.length).padStart(2, '0')}`;
  }

  function goToScene(nextIndex) {
    const activeScenes = qa('.scene');
    if (!activeScenes[nextIndex]) return;
    const previous = activeScenes.find((scene) => scene.classList.contains('is-active'));
    const next = activeScenes[nextIndex];
    if (previous === next) return;
    previous?.classList.remove('is-active');
    window.setTimeout(() => {
      if (previous) previous.hidden = true;
      next.hidden = false;
      requestAnimationFrame(() => next.classList.add('is-active'));
      currentScene = Number(next.dataset.scene);
      updateProgress();
      if (currentScene === 3) animateMessage();
      if (currentScene === 6) celebrate();
    }, 220);
  }

  function nextScene() {
    const activeScenes = qa('.scene');
    const currentIndex = activeScenes.findIndex((scene) => scene.classList.contains('is-active'));
    goToScene(currentIndex + 1);
  }

  function replay() {
    qa('.scene').forEach((scene, index) => {
      scene.hidden = index !== 0;
      scene.classList.toggle('is-active', index === 0);
    });
    currentScene = 0;
    candlesOut = 0;
    galleryIndex = 0;
    qa('.flame').forEach((flame) => flame.classList.remove('is-out'));
    q('.reveal-continue').disabled = true;
    q('#gift-box')?.classList.remove('is-open');
    q('#gift-reveal')?.setAttribute('hidden', '');
    q('#gift-instruction').textContent = 'Tap the bow when you’re ready.';
    q('#gift-continue').disabled = true;
    renderGallery();
    updateProgress();
  }

  function showNoMessage() {
    const messages = ['Nice try — that button is feeling shy.', 'You can’t escape this surprise!', 'Just press YES already!', 'The penguin believes in you. Try again?'];
    const noButton = q('#no-button');
    const message = q('#no-message');
    message.textContent = messages[noAttempts % messages.length];
    message.classList.remove('is-teasing');
    requestAnimationFrame(() => message.classList.add('is-teasing'));
    noAttempts += 1;
    const x = Math.round(Math.sin(noAttempts * 1.7) * Math.min(70, 20 + noAttempts * 9));
    const y = Math.round(Math.cos(noAttempts * 1.3) * Math.min(18, 4 + noAttempts * 3));
    noButton.style.transform = `translate(${x}px, ${y}px) rotate(${noAttempts % 2 ? -2 : 2}deg)`;
    noButton.textContent = noAttempts > 2 ? 'okay, YES!' : ['hmm… no?', 'still no?', 'not happening?'][Math.min(noAttempts - 1, 2)];
  }

  function renderGallery() {
    const track = q('#gallery-track');
    const dots = q('#gallery-dots');
    if (!track || !dots) return;
    track.innerHTML = '';
    dots.innerHTML = '';
    const photos = Array.isArray(config.photos) && config.photos.length ? config.photos : [{ src: 'assets/images/memory-01.svg', caption: 'A little memory' }];
    photos.forEach((photo, index) => {
      const card = document.createElement('article');
      card.className = 'memory-card';
      card.innerHTML = `<img src="${photo.src}" alt="${photo.caption || `Memory ${index + 1}`}" loading="lazy"><span class="memory-caption">${photo.caption || 'A little memory'}</span>`;
      track.append(card);
      const dot = document.createElement('button');
      dot.className = `gallery-dot${index === 0 ? ' is-active' : ''}`;
      dot.type = 'button';
      dot.ariaLabel = `Show memory ${index + 1}`;
      dot.addEventListener('click', () => setGallery(index));
      dots.append(dot);
    });
    setGallery(0);
  }

  function setGallery(index) {
    const track = q('#gallery-track');
    const cards = qa('.memory-card', track);
    if (!track || !cards.length) return;
    galleryIndex = (index + cards.length) % cards.length;
    const gap = 16;
    const offset = galleryIndex * (cards[0].getBoundingClientRect().width + gap);
    track.style.transform = `translateX(-${offset}px)`;
    qa('.gallery-dot').forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === galleryIndex));
    q('#gallery-count').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }

  function animateMessage() {
    const message = q('#animated-message');
    if (!message) return;
    const text = config.messageIntro ? `${config.messageIntro} ${config.birthdayMessage}` : config.birthdayMessage;
    message.textContent = '';
    [...text].forEach((character, index) => {
      const span = document.createElement('span');
      span.textContent = character === ' ' ? '\u00a0' : character;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transform = 'translateY(7px)';
      span.style.transition = `opacity .35s ease ${index * 0.018}s, transform .35s ease ${index * 0.018}s`;
      message.append(span);
      window.setTimeout(() => { span.style.opacity = '1'; span.style.transform = 'translateY(0)'; }, 50 + index * 18);
    });
  }

  function createBurst(target, count = 14) {
    if (!target) return;
    for (let index = 0; index < count; index += 1) {
      const span = document.createElement('span');
      span.className = 'burst-particle';
      span.textContent = ['♥', '✦', '✧', '·'][index % 4];
      span.style.setProperty('--x', `${Math.round(Math.cos((index / count) * Math.PI * 2) * (65 + Math.random() * 60))}px`);
      span.style.setProperty('--y', `${Math.round(Math.sin((index / count) * Math.PI * 2) * (65 + Math.random() * 60))}px`);
      span.style.animationDelay = `${index * 0.03}s`;
      target.append(span);
      window.setTimeout(() => span.remove(), 1300);
    }
  }

  function celebrate() {
    const field = q('.final-burst');
    createBurst(field, 18);
  }

  function setupAudio() {
    if (!config.enableMusic) return;
    soundToggle.addEventListener('click', () => {
      soundOn = !soundOn;
      soundToggle.setAttribute('aria-pressed', String(soundOn));
      soundLabel.textContent = soundOn ? 'sound on' : 'sound off';
      if (soundOn) playTone([261.63, 329.63, 392], .11);
    });
  }

  function playTone(notes, duration = .09) {
    if (!soundOn) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = note;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime + index * duration);
      gain.gain.exponentialRampToValueAtTime(.07, audioContext.currentTime + index * duration + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + index * duration + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(audioContext.currentTime + index * duration);
      oscillator.stop(audioContext.currentTime + index * duration + duration + .02);
    });
  }

  function bindEvents() {
    qa('[data-next]').forEach((button) => button.addEventListener('click', nextScene));
    qa('[data-replay]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); replay(); }));
    q('#no-button')?.addEventListener('click', showNoMessage);
    qa('.flame').forEach((flame) => flame.addEventListener('click', () => {
      if (flame.classList.contains('is-out')) return;
      flame.classList.add('is-out');
      candlesOut += 1;
      playTone([523.25, 659.25], .07);
      q('#reveal-status').innerHTML = candlesOut === 3 ? '<span class="status-dot"></span> wish sent — it’s on its way' : `<span class="status-dot"></span> ${3 - candlesOut} little wish${3 - candlesOut === 1 ? '' : 'es'} waiting`;
      if (candlesOut === 3) {
        q('.reveal-continue').disabled = false;
        createBurst(q('.reveal-art'), 12);
      }
    }));
    q('#gallery-prev')?.addEventListener('click', () => setGallery(galleryIndex - 1));
    q('#gallery-next')?.addEventListener('click', () => setGallery(galleryIndex + 1));
    q('#gift-box')?.addEventListener('click', () => {
      const gift = q('#gift-box');
      if (gift.classList.contains('is-open')) return;
      gift.classList.add('is-open');
      q('#gift-reveal').hidden = false;
      q('#gift-instruction').textContent = 'A little something, just for you.';
      q('#gift-continue').disabled = false;
      createBurst(q('#gift-burst'), 14);
      playTone([392, 493.88, 587.33], .1);
    });
    q('#hug-button')?.addEventListener('click', () => {
      q('#hug-response').textContent = 'Hug delivered! It came with extra squish. ♡';
      q('#hug-button').querySelector('.hug-icon').textContent = '♥';
      createBurst(q('#gift-burst'), 9);
      playTone([329.63, 392, 493.88], .09);
    });
    window.addEventListener('resize', () => setGallery(galleryIndex));
  }

  applyConfig();
  createSparkles();
  bindEvents();
  setupAudio();
  updateProgress();
})();
