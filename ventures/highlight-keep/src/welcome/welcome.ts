void chrome.commands.getAll().then((commands) => {
  const el = document.getElementById('kbd-site');
  if (el) el.textContent = commands.find((c) => c.name === 'toggle-site')?.shortcut || 'no shortcut set';
});
