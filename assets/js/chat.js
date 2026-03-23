(function() {
  var VA_API_BASE = 'https://api.vam.ac.uk/v2';
  var IMAGE_CDN_CHAT = 'https://framemark.vam.ac.uk/collections';
  var HF_MODEL = 'https://router.huggingface.co/v1/chat/completions';

  var dialog     = document.getElementById('ai-chat');
  var trigger    = document.querySelector('.chat-trigger');
  var log        = dialog ? dialog.querySelector('[role="log"]') : null;
  var form       = dialog ? dialog.querySelector('form') : null;
  var input      = dialog ? dialog.getElementById ? dialog.querySelector('#chat-input') : null : null;
  var typingEl   = null;
  var chatLog    = [];
  var STORAGE_KEY = 'va-chat-log';

  if (!dialog || !log || !form) { return; }

  input = dialog.querySelector('#chat-input');

  // ─── Focus management ────────────────────────────────────────────────────

  dialog.addEventListener('toggle', function(evt) {
    if (evt.newState === 'open') {
      if (trigger) { trigger.setAttribute('aria-label', 'Close Museum helper chat'); }
      if (input) { input.focus(); }
    } else {
      if (trigger) { trigger.setAttribute('aria-label', 'Open Museum helper chat'); }
      if (trigger) { trigger.focus(); }
    }
  });

  // ─── Restore session history ─────────────────────────────────────────────

  restoreHistory();

  // ─── Auto-expand textarea ─────────────────────────────────────────────────

  function expandInput() {
    if (!input) { return; }
    input.style.height = 'auto';
    var maxH = Math.round(dialog.clientHeight * 0.4);
    input.style.height = Math.min(input.scrollHeight, maxH) + 'px';
  }

  if (input) {
    input.addEventListener('input', expandInput);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }

  // ─── Session history ─────────────────────────────────────────────────────

  function saveHistory() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chatLog)); } catch(e) {}
  }

  function restoreHistory() {
    try {
      var saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) { return; }
      var history = JSON.parse(saved);
      if (!Array.isArray(history) || history.length === 0) { return; }
      chatLog = history;
      for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        if (entry.kind === 'message') { addMessage(entry.role, entry.text, true); }
        else if (entry.kind === 'cards') { addCardMessage(entry.records, true, entry.reason || ''); }
      }
      log.scrollTop = log.scrollHeight;
    } catch(e) {}
  }

  // ─── Message helpers ─────────────────────────────────────────────────────

  function addMessage(role, text, noSave) {
    var p = document.createElement('p');
    p.className = 'chat-message chat-message-' + role;
    if (role === 'assistant') {
      p.innerHTML =
        '<span class="chat-avatar" aria-hidden="true"></span>' +
        '<span class="chat-bubble">' + escapeHtml(text) + '</span>';
    } else {
      p.innerHTML = '<span class="chat-bubble">' + escapeHtml(text) + '</span>';
    }
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
    if (!noSave) {
      chatLog.push({ kind: 'message', role: role, text: text });
      saveHistory();
    }
  }

  function addCardMessage(records, noSave, reason) {
    if (!records || records.length === 0) { return; }
    var wrapper = document.createElement('div');
    wrapper.className = 'chat-results';
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      var title = r._primaryTitle || (r.objectType ? r.objectType : 'Untitled');
      var href = resolveDetailsPath() + 'details.html?id=' + r.systemNumber;
      var card = document.createElement('a');
      card.href = href;
      card.className = 'chat-result-card';
      card.target = '_self';
      if (r._primaryImageId) {
        var img = document.createElement('img');
        img.src = IMAGE_CDN_CHAT + '/' + r._primaryImageId + '/full/!200,200/0/default.jpg';
        img.alt = title;
        img.loading = 'lazy';
        card.appendChild(img);
      }
      var info = document.createElement('span');
      info.className = 'chat-result-info';
      if (reason) {
        var reasonEl = document.createElement('span');
        reasonEl.className = 'chat-result-reason';
        reasonEl.textContent = reason;
        info.appendChild(reasonEl);
      }
      var titleEl = document.createElement('span');
      titleEl.className = 'chat-result-title';
      titleEl.textContent = title;
      info.appendChild(titleEl);
      card.appendChild(info);
      wrapper.appendChild(card);
    }
    log.appendChild(wrapper);
    log.scrollTop = log.scrollHeight;
    if (!noSave) {
      chatLog.push({ kind: 'cards', records: records, reason: reason || '' });
      saveHistory();
    }
  }

  function showTyping() {
    typingEl = document.createElement('p');
    typingEl.className = 'chat-typing';
    typingEl.setAttribute('aria-hidden', 'true');
    typingEl.innerHTML =
      '<span class="chat-avatar" aria-hidden="true"></span>' +
      '<span class="chat-bubble"><span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span></span>';
    log.appendChild(typingEl);
    log.scrollTop = log.scrollHeight;
  }

  function hideTyping() {
    if (typingEl && typingEl.parentNode) { typingEl.parentNode.removeChild(typingEl); }
    typingEl = null;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ─── Card context collection (MutationObserver) ──────────────────────────

  var chatCards = {};

  function extractCardData(article) {
    try {
      var inner = article.querySelector('.card-inner');
      if (!inner) { return null; }
      var data = {};
      var titleEl = inner.querySelector('.card-link');
      if (titleEl) { data.title = titleEl.textContent.trim(); }
      var dts = inner.querySelectorAll('dl.metadata dt');
      for (var i = 0; i < dts.length; i++) {
        var label = dts[i].textContent.trim().toLowerCase();
        var values = [];
        var dd = dts[i].nextElementSibling;
        while (dd && dd.tagName === 'DD') { values.push(dd.textContent.trim()); dd = dd.nextElementSibling; }
        if (label === 'collection') { data.collection = values.join(', '); }
        if (label === 'categories') { data.categories = values.join(', '); }
        if (label === 'origin') { data.origin = values.join(', '); }
      }
      var dateEl = inner.querySelector('.date time');
      if (dateEl) { data.date = dateEl.textContent.trim(); }
      var creatorEl = inner.querySelector('.creator');
      if (creatorEl) { data.maker = creatorEl.textContent.replace(/^[^:]+:\s*/, '').trim(); }
      var descEl = inner.querySelector('.detail-text');
      if (descEl) { data.description = descEl.textContent.trim(); }
      return data.title ? data : null;
    } catch(e) { return null; }
  }

  function observeCards() {
    var grid = document.querySelector('.objects-grid');
    if (!grid) { return; }
    var mo = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.attributeName === 'class' && m.target.tagName === 'ARTICLE') {
          if (m.target.classList.contains('is-hovered')) {
            var articles = Array.from(grid.querySelectorAll('article'));
            var idx = articles.indexOf(m.target);
            if (idx >= 0) {
              var data = extractCardData(m.target);
              if (data) { chatCards[idx] = data; }
            }
          }
        }
      }
    });
    mo.observe(grid, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  observeCards();

  // ─── Context & system prompt ─────────────────────────────────────────────

  var VA_CATALOGUE =
    'This site has four distinct browsing pathways — understand each clearly: ' +
    '(1) COLLECTION: the curatorial department that owns the object, e.g. "Prints, Drawings & Paintings" or "East Asia". An object belongs to exactly one collection. The following are the collections browsable in this prototype (filtered to objects with images — this is not the full V&A catalogue, so do not make absolute claims like "smallest" or "largest" across the whole museum). Browsable collections with live object counts: Prints, Drawings & Paintings (309,865), East Asia (64,347), Ceramics (55,300), South & South East Asia (39,395), Metalwork (24,420), Department of Photography (23,961), V&A Wedgwood Collection (17,650), Middle East (13,447), Young V&A (10,301), Furniture and Woodwork (9,523), Sculpture (8,079), National Art Library (2,612), Design, Architecture & Digital (856). ' +
    '(2) CATEGORY: the type or subject of the object, e.g. "Prints", "Clothing", "Sculpture". An object can belong to multiple categories. Browsable categories with live object counts: Prints (104,369), Designs (89,079), Clothing (32,056), Metalwork (31,095), Womenswear (31,016), Architecture (23,374), Paintings (19,521), Porcelain (17,941), Accessories (17,041), Theatre (16,819), Religion (13,139), Topography (12,621), India Museum (11,899), Sculpture (11,213), Christianity (10,832), Children & Childhood (10,046), Tourism & Travel (8,928), Illustration (8,818), Europeana Fashion Project (8,533), Glass (6,425), Wall coverings (4,588), Books (4,051), Printmaking techniques (1,198). ' +
    '(3) MATERIAL: the physical substance the object is made from, e.g. "paper", "silk", "earthenware". An object can have multiple materials. Many more materials exist in the full V&A collection — the following are the main browsable ones in this prototype: Paper (164,120), Ink (95,557), Watercolour (80,865), Pencil (54,997), Photographic Paper (48,434), Pen and Ink (41,737), Earthenware (22,948), Silk (19,185), Cotton (17,363), Porcelain (17,007), Glass (13,271), Card (9,781), Silver (9,769), Wood (8,542), Paint (8,290), Wash (8,149), Gold (7,434), Steel (2,603), Tracing Paper (1,657). ' +
    '(4) ORIGIN: the place where the object was made or comes from, e.g. "Japan", "London", "France". Many more origins exist in the full V&A collection — the following are the main browsable ones in this prototype: Great Britain (80,234), London (66,722), England (48,076), Japan (37,444), Paris (36,123), France (25,835), Italy (15,349), China (12,747), Germany (10,455), Egypt (6,808), United States (5,924), United Kingdom (5,290), Netherlands (3,889), Europe (3,628), Stoke-on-Trent (3,221), Staffordshire (3,014), Spain (2,928), Birmingham (1,179), Belgium (1,121), Amsterdam (1,112), North Europe (354), Royal Leamington Spa (19). ' +
    'When suggesting how to explore further, use the correct pathway term (collection / category / material / origin) so the user knows which browse filter to use.';

  function buildSystemPrompt() {
    var ctx = window.chatContext || {};
    var base = 'You are a knowledgeable and friendly museum guide for the Victoria and Albert Museum (V&A) in London. ' +
      'The V&A collection includes decorative arts, fashion, textiles, furniture, sculpture, ceramics, glass, metalwork, jewellery, photography, prints, drawings, and Asian art — primarily spanning the medieval period to the mid-20th century. ' +
      'It does NOT include purely fine art oil paintings (those are at the National Gallery), works from other museums, most living contemporary artists, or objects not in the V&A permanent collection. ' +
      'Always explain the historical significance of items and artists. ' +
      'Suggest related topics the user might find interesting. ' +
      'Keep responses concise and engaging. ' +
      'Only describe objects that were actually found — never invent or promise items that do not exist. ' +
      'Do not make up facts. If you are unsure, say so. ' +
      VA_CATALOGUE;

    if (ctx.page === 'details' && ctx.title) {
      var context = 'The user is currently viewing: "' + ctx.title + '"';
      if (ctx.objectType) { context += ', a ' + ctx.objectType; }
      if (ctx.date) { context += ' dating from ' + ctx.date; }
      if (ctx.maker) { context += ', made by ' + ctx.maker; }
      if (ctx.collection) { context += ', in the ' + ctx.collection + ' collection'; }
      if (ctx.summary && ctx.summary.trim()) {
        context += '. About this object: ' + ctx.summary.replace(/<[^>]+>/g, '').substring(0, 400);
      }
      context += '.';
      return base + ' ' + context;
    }

    if (ctx.page === 'browse' && ctx.type && ctx.name) {
      return base + ' The user is currently browsing the ' + ctx.type + ' page for "' + ctx.name + '" in the V&A collection.';
    }

    var knownIdxs = Object.keys(chatCards).map(Number).sort(function(a, b) { return a - b; });
    if (knownIdxs.length > 0) {
      var cardList = knownIdxs.map(function(idx) {
        var c = chatCards[idx];
        var desc = 'Tile ' + (idx + 1) + ': "' + c.title + '"';
        if (c.maker) { desc += ' by ' + c.maker; }
        if (c.date) { desc += ' (' + c.date + ')'; }
        if (c.collection) { desc += ', ' + c.collection + ' collection'; }
        if (c.categories) { desc += ', categories: ' + c.categories; }
        if (c.origin) { desc += ', origin: ' + c.origin; }
        if (c.description) { desc += ', "' + c.description + '"'; }
        return desc;
      }).join(' | ');
      return base + ' The user is exploring the V&A Museum collection. Known tiles on screen: ' + cardList + '.';
    }

    return base + ' The user is exploring the V&A Museum collection.';
  }

  // Work out how many directories deep this page is so details.html links are correct
  function resolveDetailsPath() {
    var depth = (window.location.pathname.match(/\//g) || []).length - 1;
    var prefix = '';
    for (var i = 0; i < depth - 1; i++) { prefix += '../'; }
    return prefix;
  }

  // ─── V&A search bridge ───────────────────────────────────────────────────

  function searchVA(query) {
    var url = VA_API_BASE + '/objects/search?q=' + encodeURIComponent(query) +
      '&page_size=3&images_exist=1&fields=systemNumber,_primaryTitle,_primaryImageId,objectType,_primaryDate';
    return fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(data) { return data.records || []; })
      .catch(function() { return []; });
  }

  // ─── AI engine ───────────────────────────────────────────────────────────

  function hfFetch(messages, maxTokens, temperature) {
    var token = (typeof HUGGING_FACE_TOKEN !== 'undefined') ? HUGGING_FACE_TOKEN : '';
    return fetch(HF_MODEL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature
      })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content.trim();
        }
        throw new Error('Unexpected response format');
      });
  }

  function askAI(userMessage) {
    var systemPrompt;
    try { systemPrompt = buildSystemPrompt(); } catch(e) { systemPrompt = 'You are a knowledgeable museum guide for the Victoria and Albert Museum in London.'; }

    var intentInstruction = systemPrompt +
      ' If the user asks you to find, show, or search for objects, respond with ONLY two lines — line 1: "SEARCH: [search term]", line 2: "REASON: [brief phrase]" — and nothing else. For all other questions respond normally.';

    // Pass 1 — intent detection (short, fast)
    return hfFetch(
      [{ role: 'system', content: intentInstruction }, { role: 'user', content: userMessage }],
      80, 0.3
    ).then(function(intent) {
      var searchMatch = intent.match(/SEARCH:\s*(.+)/i);
      if (!searchMatch) {
        // No search needed — direct response
        return { text: intent, records: [], reason: '' };
      }

      var query = searchMatch[1].split('\n')[0].trim();
      var reasonMatch = intent.match(/REASON:\s*(.+)/i);
      var reason = reasonMatch ? reasonMatch[1].split('\n')[0].trim() : '';

      // Run search first, then Pass 2 with actual results
      return searchVA(query).then(function(records) {
        var resultsSummary = records && records.length > 0
          ? 'The search returned ' + records.length + ' result(s): ' +
            records.map(function(r) { return '"' + (r._primaryTitle || r.objectType || 'Untitled') + '"'; }).join(', ') +
            '. Write your response to the user based only on what was actually found.'
          : 'The search returned no results for "' + query + '". Let the user know and suggest alternative search terms or topics.';

        // Pass 2 — final response with knowledge of results
        return hfFetch([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
          { role: 'assistant', content: intent },
          { role: 'user', content: resultsSummary }
        ], 400, 0.7).then(function(finalText) {
          return { text: finalText, records: records || [], reason: reason };
        });
      });
    });
  }

  // ─── Response handler ────────────────────────────────────────────────────

  function processResponse(result) {
    if (result.text) { addMessage('assistant', result.text); }
    if (result.records && result.records.length > 0) {
      addCardMessage(result.records, false, result.reason);
    }
  }

  // ─── Form submit ─────────────────────────────────────────────────────────

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!input) { return; }
    var userText = input.value.trim();
    if (!userText) { return; }
    input.value = '';
    input.style.height = 'auto';
    addMessage('user', userText);
    showTyping();
    askAI(userText)
      .then(function(result) {
        hideTyping();
        processResponse(result);
      })
      .catch(function() {
        hideTyping();
        addMessage('assistant', 'I\'m having trouble connecting right now. Please try again shortly.');
      });
  });

}());
