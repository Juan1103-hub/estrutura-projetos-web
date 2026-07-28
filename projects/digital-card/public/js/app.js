const ICONS = {
  email: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  phone: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  website: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m2 12 20 0"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  linkedin: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  github: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  whatsapp: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>',
  download: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
};

const API_URL = '/api/card';

function getEl(id) {
  return document.getElementById(id);
}

function setVisible(el, visible) {
  if (!el) return;
  el.hidden = !visible;
}

function renderCard(card) {
  const avatar = getEl('avatar');
  if (avatar) {
    avatar.src = card.avatar || '';
    avatar.alt = card.name ? 'Foto de perfil de ' + card.name : 'Foto de perfil';
  }

  const name = getEl('name');
  if (name) name.textContent = card.name || '';

  const title = getEl('title');
  if (title) title.textContent = card.title || '';

  const company = getEl('company');
  if (company) company.textContent = card.company || '';

  const email = getEl('email');
  const iconEmail = getEl('icon-email');
  if (email && card.email) {
    email.href = 'mailto:' + card.email;
    email.textContent = card.email;
    setVisible(email, true);
    if (iconEmail) iconEmail.innerHTML = ICONS.email;
    setVisible(iconEmail, true);
  } else {
    if (email) setVisible(email, false);
    if (iconEmail) setVisible(iconEmail, false);
  }

  const phone = getEl('phone');
  const iconPhone = getEl('icon-phone');
  if (phone && card.phone) {
    phone.href = 'tel:' + card.phone;
    phone.textContent = card.phone;
    setVisible(phone, true);
    if (iconPhone) iconPhone.innerHTML = ICONS.phone;
    setVisible(iconPhone, true);
  } else {
    if (phone) setVisible(phone, false);
    if (iconPhone) setVisible(iconPhone, false);
  }

  const website = getEl('website');
  const iconWebsite = getEl('icon-website');
  if (website && card.website) {
    const url = card.website.startsWith('http') ? card.website : 'https://' + card.website;
    website.href = url;
    try {
      website.textContent = new URL(url).hostname;
    } catch (_) {
      website.textContent = card.website;
    }
    setVisible(website, true);
    if (iconWebsite) iconWebsite.innerHTML = ICONS.website;
    setVisible(iconWebsite, true);
  } else {
    if (website) setVisible(website, false);
    if (iconWebsite) setVisible(iconWebsite, false);
  }

  const linkedin = getEl('linkedin');
  const iconLinkedin = getEl('icon-linkedin');
  if (linkedin && card.social?.linkedin) {
    linkedin.href = card.social.linkedin;
    linkedin.innerHTML = ICONS.linkedin;
    setVisible(linkedin, true);
    if (iconLinkedin) setVisible(iconLinkedin, true);
  } else {
    if (linkedin) setVisible(linkedin, false);
    if (iconLinkedin) setVisible(iconLinkedin, false);
  }

  const github = getEl('github');
  const iconGithub = getEl('icon-github');
  if (github && card.social?.github) {
    github.href = card.social.github;
    github.innerHTML = ICONS.github;
    setVisible(github, true);
    if (iconGithub) setVisible(iconGithub, true);
  } else {
    if (github) setVisible(github, false);
    if (iconGithub) setVisible(iconGithub, false);
  }

  const whatsapp = getEl('whatsapp');
  const iconWhatsapp = getEl('icon-whatsapp');
  if (whatsapp && card.social?.whatsapp) {
    whatsapp.href = card.social.whatsapp;
    whatsapp.innerHTML = ICONS.whatsapp;
    setVisible(whatsapp, true);
    if (iconWhatsapp) setVisible(iconWhatsapp, true);
  } else {
    if (whatsapp) setVisible(whatsapp, false);
    if (iconWhatsapp) setVisible(iconWhatsapp, false);
  }

  const downloadIcon = getEl('icon-download');
  if (downloadIcon) downloadIcon.innerHTML = ICONS.download;
}

function showError(message) {
  const loading = getEl('loading');
  const card = getEl('card');
  const errorEl = getEl('error');
  if (loading) setVisible(loading, false);
  if (card) setVisible(card, false);
  if (!errorEl) return;
  const msgEl = errorEl.querySelector('.error-message');
  if (msgEl) msgEl.textContent = message;
  setVisible(errorEl, true);
  const retryBtn = errorEl.querySelector('.error-retry');
  if (retryBtn) retryBtn.addEventListener('click', loadCard);
}

function showLoading() {
  const loading = getEl('loading');
  const card = getEl('card');
  const errorEl = getEl('error');
  if (loading) setVisible(loading, true);
  if (card) setVisible(card, false);
  if (errorEl) setVisible(errorEl, false);
}

function showCard() {
  const loading = getEl('loading');
  const card = getEl('card');
  if (loading) setVisible(loading, false);
  if (card) setVisible(card, true);
}

function generateVCard(card) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:' + (card.name || ''),
    'FN:' + (card.name || ''),
    'ORG:' + (card.company || ''),
    'TITLE:' + (card.title || ''),
    'TEL:' + (card.phone || ''),
    'EMAIL:' + (card.email || ''),
    'URL:' + (card.website || ''),
  ];
  if (card.social?.linkedin) lines.push('NOTE:LinkedIn: ' + card.social.linkedin);
  if (card.social?.github) lines.push('NOTE:GitHub: ' + card.social.github);
  if (card.social?.whatsapp) lines.push('NOTE:WhatsApp: ' + card.social.whatsapp);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

function downloadVCard(card) {
  const vcf = generateVCard(card);
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (card.name || 'card').replace(/\s+/g, '-').toLowerCase() + '.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function loadCard() {
  showLoading();
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Falha ao carregar o cartão');
    const card = await res.json();
    renderCard(card);
    showCard();
    const downloadBtn = getEl('download-vcard');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        downloadVCard(card);
      });
    }
  } catch (_err) {
    showError('Não foi possível carregar o cartão. Verifique sua conexão e tente novamente.');
  }
}

document.addEventListener('DOMContentLoaded', loadCard);