(function () {
  const META = window.FONDATION_SUPPORT?.meta || {};
  const STORAGE_KEY = META.storageKey || 'fondation_support_completed_sections_v2';
  const FORM_STORAGE_KEY = META.formStorageKey || 'fondation_support_forms_v2';

  function qs(id) {
    return document.getElementById(id);
  }

  function getSections() {
    return Array.isArray(window.FONDATION_SUPPORT?.sections) ? window.FONDATION_SUPPORT.sections : [];
  }

  function getTrackableSections() {
    return getSections().filter(section => section.trackCompletion !== false);
  }

  function getDefaultSectionId() {
    return getSections()[0]?.id || null;
  }

  function loadState() {
    const fallback = {
      currentSectionId: getDefaultSectionId(),
      completedIds: []
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return {
        currentSectionId: parsed.currentSectionId || fallback.currentSectionId,
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : []
      };
    } catch (error) {
      console.warn('⚠️ État du support illisible, réinitialisation.', error);
      return fallback;
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentSectionId: state.currentSectionId,
      completedIds: state.completedIds
    }));
  }

  function loadForms() {
    const fallback = {
      'checkin-home': {
        feelingsHome: '',
        likesHome: '',
        heavinessHome: '',
        greenery: '',
        waterMantra: ''
      },
      'effet-miroir-checkin': {
        pastQualitiesDefects: '',
        grownQualitiesDefects: ''
      },
      'entourage-quality': {
        people: [createEmptyPerson()]
      }
    };

    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      const legacyCheckin = parsed.checkinHome || {};
      const legacyMirror = parsed.effectMirror || {};
      const canonicalCheckin = parsed['checkin-home'] || {};
      const canonicalMirror = parsed['effet-miroir-checkin'] || {};

      const people =
        parsed['entourage-quality']?.people ??
        parsed.entourageQuality?.people;

      return {
        'checkin-home': {
          ...fallback['checkin-home'],
          ...legacyCheckin,
          ...canonicalCheckin
        },
        'effet-miroir-checkin': {
          ...fallback['effet-miroir-checkin'],
          pastQualitiesDefects:
            canonicalMirror.pastQualitiesDefects ??
            legacyMirror.pastQualitiesDefects ??
            legacyCheckin.pastQualitiesDefects ??
            '',
          grownQualitiesDefects:
            canonicalMirror.grownQualitiesDefects ??
            legacyMirror.grownQualitiesDefects ??
            legacyCheckin.grownQualitiesDefects ??
            ''
        },
        'entourage-quality': {
          people: normalizePeople(people)
        }
      };
    } catch (error) {
      console.warn('⚠️ Données du support illisibles, réinitialisation.', error);
      return fallback;
    }
  }

  function saveForms(forms) {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(forms));
  }

  function createEmptyPerson() {
    return {
      id: `person_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      who: '',
      brings: '',
      burdens: '',
      gauge: ''
    };
  }

  function normalizePeople(people) {
    if (!Array.isArray(people) || people.length === 0) {
      return [createEmptyPerson()];
    }

    return people.map((person, index) => ({
      id: person?.id || `person_${index}_${Math.random().toString(36).slice(2, 8)}`,
      who: person?.who || '',
      brings: person?.brings || '',
      burdens: person?.burdens ?? person?.weighs ?? '',
      gauge: ['1', '2', '3', '4', '5'].includes(String(person?.gauge || ''))
        ? String(person.gauge)
        : ''
    }));
  }

  function getSectionById(sectionId) {
    return getSections().find(section => section.id === sectionId) || null;
  }

  function getSectionIndex(sectionId) {
    return getSections().findIndex(section => section.id === sectionId);
  }

  function isCompleted(sectionId) {
    return loadState().completedIds.includes(sectionId);
  }

  function setCurrentSection(sectionId) {
    const state = loadState();
    state.currentSectionId = sectionId;
    saveState(state);
  }

  function toggleCompleted(sectionId) {
    const section = getSectionById(sectionId);
    if (!section || section.trackCompletion === false) return;

    const state = loadState();
    const alreadyDone = state.completedIds.includes(sectionId);

    if (alreadyDone) {
      state.completedIds = state.completedIds.filter(id => id !== sectionId);
    } else {
      state.completedIds.push(sectionId);
    }

    saveState(state);
  }

  function getCompletionStats() {
    const state = loadState();
    const trackable = getTrackableSections();
    const completed = trackable.filter(section => state.completedIds.includes(section.id)).length;
    const total = trackable.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }

  function buildTocHTML() {
    const state = loadState();

    return `
      <ul class="support-toc-list">
        ${getSections().map((section, index) => {
          const active = state.currentSectionId === section.id;
          const done = section.trackCompletion !== false && state.completedIds.includes(section.id);
          const meta = section.trackCompletion === false ? 'Informatif' : (done ? 'Terminé' : 'À explorer');

          return `
            <li class="support-toc-item">
              <button
                type="button"
                class="support-toc-btn ${active ? 'is-active' : ''} ${done ? 'is-completed' : ''}"
                data-support-section-id="${section.id}"
              >
                <span class="support-toc-title">${section.shortLabel || section.label || `Chapitre ${index + 1}`}</span>
                <span class="support-toc-meta">${meta}</span>
              </button>
            </li>
          `;
        }).join('')}
      </ul>
    `;
  }

  function renderProgress() {
    const stats = getCompletionStats();
    const value = `${stats.percent}%`;
    const meta = `${stats.completed}/${stats.total} chapitres terminés`;

    if (qs('support-progress-value')) qs('support-progress-value').textContent = value;
    if (qs('support-progress-meta')) qs('support-progress-meta').textContent = meta;
    if (qs('support-progress-value-mobile')) qs('support-progress-value-mobile').textContent = value;
    if (qs('support-progress-meta-mobile')) qs('support-progress-meta-mobile').textContent = meta;
  }

  function renderToc() {
    const html = buildTocHTML();
    if (qs('support-toc')) qs('support-toc').innerHTML = html;
    if (qs('support-toc-mobile')) qs('support-toc-mobile').innerHTML = html;
  }

  function renderCurrentSection() {
    const state = loadState();
    const current = getSectionById(state.currentSectionId) || getSections()[0] || null;
    if (!current) return;

    const content = qs('support-content');
    const currentTitle = qs('support-topbar-current');
    const currentSub = qs('support-topbar-sub');
    const statusBadge = qs('support-status-badge');
    const advanceBtn = qs('support-advance-btn');
    const prevBtn = qs('support-prev-btn');
    const contentWrap = qs('support-content-wrap');
    const subtitle = qs('support-sidebar-subtitle');

    if (content) content.innerHTML = current.html || '<p>Contenu indisponible.</p>';
    if (subtitle) subtitle.textContent = window.FONDATION_SUPPORT?.meta?.subtitle || '';
    if (currentTitle) currentTitle.textContent = current.shortLabel || current.label || 'FONDATION';
    if (currentSub) currentSub.textContent = current.trackCompletion === false ? 'Chapitre informatif' : 'Chapitre du support';

    const done = isCompleted(current.id);

    if (statusBadge) {
      if (current.trackCompletion === false) {
        statusBadge.className = 'support-status-badge is-pending';
        statusBadge.textContent = 'Informatif';
      } else if (done) {
        statusBadge.className = 'support-status-badge is-done';
        statusBadge.textContent = 'Terminé';
      } else {
        statusBadge.className = 'support-status-badge is-pending';
        statusBadge.textContent = 'À explorer';
      }
    }

    const index = getSectionIndex(current.id);
    const isLastSection = index >= getSections().length - 1;

    if (prevBtn) prevBtn.disabled = index <= 0;

    if (advanceBtn) {
      if (current.trackCompletion === false) {
        advanceBtn.disabled = isLastSection;
        advanceBtn.className = 'support-btn support-btn--ghost';
        advanceBtn.textContent = isLastSection ? 'ℹ️ Fin du support' : 'Chapitre suivant →';
      } else if (done) {
        advanceBtn.disabled = isLastSection;
        advanceBtn.className = 'support-btn support-btn--done';
        advanceBtn.textContent = isLastSection ? '✅ Chapitre terminé' : '✅ Terminé - chapitre suivant';
      } else {
        advanceBtn.disabled = false;
        advanceBtn.className = 'support-btn support-btn--primary';
        advanceBtn.textContent = '✅ Terminer et passer au suivant';
      }
    }

    initDynamicSection(current.id);

    if (contentWrap) contentWrap.scrollTop = 0;
  }

  function render() {
    renderProgress();
    renderToc();
    renderCurrentSection();
  }

  function goToSection(sectionId) {
    if (!getSectionById(sectionId)) return;
    setCurrentSection(sectionId);
    render();
    closeDrawer();
  }

  function goToAdjacent(direction) {
    const state = loadState();
    const currentIndex = getSectionIndex(state.currentSectionId);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= getSections().length) return;
    goToSection(getSections()[nextIndex].id);
  }

  function advanceCurrentSection() {
    const state = loadState();
    const current = getSectionById(state.currentSectionId);
    if (!current) return;

    if (current.trackCompletion !== false && !isCompleted(current.id)) {
      toggleCompleted(current.id);
    }

    const currentIndex = getSectionIndex(current.id);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= 0 && nextIndex < getSections().length) {
      setCurrentSection(getSections()[nextIndex].id);
    }

    render();
  }

  function open() {
    const overlay = qs('support-overlay');
    if (!overlay) return;
    render();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    const overlay = qs('support-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    closeDrawer();
    document.body.style.overflow = '';
  }

  function openDrawer() {
    const drawer = qs('support-mobile-drawer');
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    const drawer = qs('support-mobile-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function updateSaveStatus(formName, message = 'Sauvegardé automatiquement') {
    document.querySelectorAll(`[data-support-save-status="${formName}"]`).forEach((node) => {
      node.textContent = message;
    });
  }

  /*
   * Initialise les formulaires présents dans le chapitre actuellement affiché.
   * La logique repose sur data-support-form, et non sur l'id du chapitre :
   * un futur déplacement d'exercice ne cassera donc plus sa sauvegarde.
   */
  function initDynamicSection() {
    const content = qs('support-content');
    if (!content) return;

    content.querySelectorAll('.support-dynamic-form[data-support-form]').forEach((formRoot) => {
      if (formRoot.querySelector('[data-support-people-list]')) {
        initPeopleForm(formRoot);
      } else {
        initSimpleForm(formRoot);
      }
    });
  }

  function initSimpleForm(root) {
    const formName = root.getAttribute('data-support-form');
    if (!formName || root.dataset.supportBound === 'true') return;

    const forms = loadForms();
    const data = forms[formName] || {};

    root.querySelectorAll('[data-support-input]').forEach((field) => {
      const key = field.getAttribute('data-support-input');
      if (!key) return;

      field.value = data[key] || '';

      field.addEventListener('input', function () {
        const latest = loadForms();
        latest[formName] = {
          ...(latest[formName] || {}),
          [key]: field.value
        };
        saveForms(latest);
        updateSaveStatus(formName);
      });
    });

    root.dataset.supportBound = 'true';
    updateSaveStatus(formName);
  }

  function getGaugeOptions() {
    return [
      { value: '1', label: 'Freins très forts', className: 'is-gauge-1' },
      { value: '2', label: 'Plutôt lourd', className: 'is-gauge-2' },
      { value: '3', label: 'Mitigé', className: 'is-gauge-3' },
      { value: '4', label: 'Plutôt bénéfique', className: 'is-gauge-4' },
      { value: '5', label: 'Très bénéfique', className: 'is-gauge-5' }
    ];
  }

  function renderPeopleList(root) {
    const formName = root.getAttribute('data-support-form');
    const container = root.querySelector('[data-support-people-list]');
    if (!formName || !container) return;

    const forms = loadForms();
    const people = normalizePeople(forms[formName]?.people);
    forms[formName] = { ...(forms[formName] || {}), people };
    saveForms(forms);

    container.innerHTML = people.map((person, index) => {
      const gaugeOptions = getGaugeOptions().map((option) => `
        <label class="support-gauge-option ${option.className}">
          <input
            type="radio"
            name="support-gauge-${person.id}"
            value="${option.value}"
            data-person-field="gauge"
            ${person.gauge === option.value ? 'checked' : ''}
          >
          <span class="support-gauge-dot" aria-hidden="true"></span>
          <span class="support-sr-only">${option.label}</span>
        </label>
      `).join('');

      return `
        <article class="support-person-card" data-person-id="${person.id}">
          <div class="support-person-head">
            <h3>Personne ${index + 1}</h3>
            <button
              type="button"
              class="support-remove-person-btn"
              data-support-action="remove-person"
              data-person-id="${person.id}"
              ${people.length <= 1 ? 'disabled' : ''}
            >Supprimer</button>
          </div>

          <div class="support-person-grid">
            <label class="support-mini-card">
              <span class="support-mini-title">Qui ?</span>
              <textarea class="support-textarea support-textarea--mini" rows="3" data-person-field="who">${escapeHtml(person.who)}</textarea>
            </label>

            <label class="support-mini-card">
              <span class="support-mini-title">Ce qu'il/elle m'apporte</span>
              <textarea class="support-textarea support-textarea--mini" rows="3" data-person-field="brings">${escapeHtml(person.brings)}</textarea>
            </label>

            <label class="support-mini-card">
              <span class="support-mini-title">Ce qui m'angoisse ou m'alourdit chez lui/elle</span>
              <textarea class="support-textarea support-textarea--mini" rows="3" data-person-field="burdens">${escapeHtml(person.burdens)}</textarea>
            </label>

            <div class="support-mini-card support-mini-card--gauge">
              <span class="support-mini-title">Jauge des freins et bénéfices</span>
              <div class="support-gauge-row">${gaugeOptions}</div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function initPeopleForm(root) {
    const formName = root.getAttribute('data-support-form');
    if (!formName) return;

    renderPeopleList(root);

    if (root.dataset.supportBound === 'true') {
      updateSaveStatus(formName);
      return;
    }

    root.addEventListener('click', function (event) {
      const addButton = event.target.closest('[data-support-action="add-person"]');
      if (addButton && root.contains(addButton)) {
        const forms = loadForms();
        const people = normalizePeople(forms[formName]?.people);
        people.push(createEmptyPerson());
        forms[formName] = { ...(forms[formName] || {}), people };
        saveForms(forms);
        renderPeopleList(root);
        updateSaveStatus(formName);
        return;
      }

      const removeButton = event.target.closest('[data-support-action="remove-person"]');
      if (removeButton && root.contains(removeButton)) {
        const personId = removeButton.getAttribute('data-person-id');
        const forms = loadForms();
        let people = normalizePeople(forms[formName]?.people)
          .filter((person) => person.id !== personId);

        if (!people.length) people = [createEmptyPerson()];

        forms[formName] = { ...(forms[formName] || {}), people };
        saveForms(forms);
        renderPeopleList(root);
        updateSaveStatus(formName);
      }
    });

    root.addEventListener('input', function (event) {
      const fieldName = event.target.getAttribute?.('data-person-field');
      if (!fieldName || fieldName === 'gauge') return;

      const card = event.target.closest('[data-person-id]');
      if (!card) return;

      updatePerson(formName, card.getAttribute('data-person-id'), fieldName, event.target.value);
    });

    root.addEventListener('change', function (event) {
      if (!event.target.matches('input[type="radio"][data-person-field="gauge"]')) return;

      const card = event.target.closest('[data-person-id]');
      if (!card) return;

      updatePerson(formName, card.getAttribute('data-person-id'), 'gauge', event.target.value);
    });

    root.dataset.supportBound = 'true';
    updateSaveStatus(formName);
  }

  function updatePerson(formName, personId, fieldName, value) {
    const forms = loadForms();
    const people = normalizePeople(forms[formName]?.people).map((person) => {
      if (person.id !== personId) return person;
      return { ...person, [fieldName]: value };
    });

    forms[formName] = { ...(forms[formName] || {}), people };
    saveForms(forms);
    updateSaveStatus(formName);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      const tocBtn = event.target.closest('[data-support-section-id]');
      if (tocBtn) {
        goToSection(tocBtn.getAttribute('data-support-section-id'));
        return;
      }

      if (event.target.closest('#support-close-btn')) {
        close();
        return;
      }

      if (event.target.closest('#support-menu-btn')) {
        openDrawer();
        return;
      }

      if (event.target.closest('#support-mobile-close-btn') || event.target.closest('#support-mobile-backdrop')) {
        closeDrawer();
        return;
      }

      if (event.target.closest('#support-prev-btn')) {
        goToAdjacent(-1);
        return;
      }

      if (event.target.closest('#support-advance-btn')) {
        advanceCurrentSection();
        return;
      }

    });

    document.addEventListener('keydown', function (event) {
      const overlay = qs('support-overlay');
      if (!overlay || !overlay.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
    });
  }

  function init() {
    if (!window.FONDATION_SUPPORT || !Array.isArray(window.FONDATION_SUPPORT.sections)) {
      console.warn('⚠️ FONDATION_SUPPORT introuvable.');
      return;
    }

    const state = loadState();
    if (!getSectionById(state.currentSectionId)) {
      saveState({
        currentSectionId: getDefaultSectionId(),
        completedIds: state.completedIds || []
      });
    }

    const forms = loadForms();
    saveForms(forms);

    bindEvents();
    render();
  }

  window.FondationSupportOverlay = {
    init,
    open,
    close,
    render
  };

  document.addEventListener('DOMContentLoaded', init);
})();
