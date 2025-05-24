function setupEditor() {
  const span = document.querySelector('.current-episodes');
  const form = document.querySelector('form[action^="/api/v2/user_rates/"]');
  const userRateId = form?.getAttribute('action')?.match(/\/user_rates\/(\d+)/)?.[1];

  if (!form || !span || !userRateId) return;

  if (span.dataset.editorAttached === 'true') return;
  span.dataset.editorAttached = 'true';

  const updateUrl = `https://shikimori.one/api/v2/user_rates/${userRateId}`;

  span.addEventListener('click', () => {
    const currentValue = parseInt(span.textContent.trim(), 10);
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.value = currentValue;
    input.className = 'current-episodes-input';
    input.style.width = '50px';
    input.style.fontSize = 'inherit';
    input.style.border = '1px solid #ccc';

    span.replaceWith(input);
    input.focus();

    let submitted = false;

    function submitUpdate() {
      if (submitted) return;
      submitted = true;

      const newValue = parseInt(input.value.trim(), 10);
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
      const authenticity =
        document.querySelector('meta[name="csrf-param"] + meta')?.content || csrf;

      const params = new URLSearchParams();
      params.append('_method', 'patch');
      params.append('authenticity_token', authenticity);
      params.append('user_rate[episodes]', newValue);

      fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-CSRF-Token': csrf,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: params.toString()
      })
        .then(res => {
          if (!res.ok) throw new Error('Update failed');
          return res.json();
        })
        .then(() => {
          const newSpan = document.createElement('span');
          newSpan.className = 'current-episodes';
          newSpan.textContent = newValue;
          input.replaceWith(newSpan);
          setupEditor(); // reattach to new span
        })
        .catch(err => {
          alert('Could not update episodes.');
          console.error(err);
          input.replaceWith(span);
          setupEditor(); // fallback
        });
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
        submitUpdate();
      }
    });

    input.addEventListener('blur', submitUpdate);
  });
}

// === Lightweight DOM observer to wait for the target ===
const observer = new MutationObserver(() => {
  const span = document.querySelector('.current-episodes');
  const form = docum
