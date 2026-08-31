/* ═══════════════════════════════════════════════════════════
   mobile-nav.js — YLG Bullion International
   Injects mobile top header + bottom nav on every page.
   Include once before </body>:
     <script src="mobile-nav.js"></script>
   ═══════════════════════════════════════════════════════════ */
(function () {

    /* ── Which page are we on? ── */
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var isDash    = (page === 'index.html' || page === '');
    var isTrading = (page === 'trading.html' || page === 'trading-interface.html');
    var isWallet  = (page === 'wallet.html' || page === 'withdraw.html');
    var isAccount = !isDash && !isTrading && !isWallet;

    /* ── Nav labels (3 languages) ── */
    var L = {
        en: { dash:'Dashboard', trade:'Trading', wall:'Wallet', acct:'Manage account', acctItem:'Account',
              panel:'My Account', port:'Portfolio', hist:'History',
              kyc:'KYC', comp:'Complaints', faq:'FAQ', sup:'Live Support', about:'About Us' },
        mm: { dash:'ပင်မ', trade:'ရောင်းဝယ်', wall:'ပိုက်ဆံအိတ်', acct:'အကောင့်စီမံ', acctItem:'အကောင့်',
              panel:'ကျွန်ုပ်အကောင့်', port:'ပိုင်ဆိုင်မှုစာရင်း', hist:'မှတ်တမ်း',
              kyc:'KYC', comp:'တိုင်ကြားစာ', faq:'FAQ', sup:'အွန်လိုင်းဝန်ဆောင်မှု', about:'ကျွန်ုပ်တို့အကြောင်း' },
        th:  { dash:'หน้าหลัก', trade:'เทรด', wall:'กระเป๋า', acct:'จัดการบัญชี', acctItem:'บัญชี',
               panel:'บัญชีของฉัน', port:'พอร์ตโฟลิโอ', hist:'ประวัติ',
               kyc:'KYC', comp:'ร้องเรียน', faq:'FAQ', sup:'ซัพพอร์ต', about:'เกี่ยวกับเรา' }
    };

    function lbl(lang) { return L[lang] || L.en; }

    /* ── Read stored user info ── */
    function getMemberName() { return localStorage.getItem('memberName') || localStorage.getItem('userName') || ''; }
    function getMemberId()   { return localStorage.getItem('memberId')   || localStorage.getItem('userShortUID') || '—'; }

    /* ── HTML builders ── */
    function isLoggedIn() { return !!localStorage.getItem('userEmail'); }

    function buildTopHeader(lang) {
        var name = getMemberName();
        var mid  = getMemberId();
        var userStyle = !isLoggedIn() ? 'display:none;text-decoration:none;' : 'text-decoration:none;';
        return [
            '<div class="mobile-top-header" id="mobile-top-header">',
            '  <div class="mobile-left-group">',
            '    <a href="account.html" class="mobile-user-badge" style="text-decoration:none;">',
            '      <img src="logo.png" alt="YLG" onerror="this.src=\'https://ui-avatars.com/api/?name=YLG&background=C9A84C&color=000&bold=true\'">',
            '    </a>',
            '    <a href="account.html" class="mobile-user-section" id="mobile-user-section" style="' + userStyle + '">',
            '      <div class="mobile-user-info">',
            '        <div class="mobile-user-name" id="mobile-user-name">' + (name || 'YLG Member') + '</div>',
            '        <div class="mobile-uid-row">',
            '          <span id="mobile-uid-text">' + mid + '</span>',
            '          <button class="mobile-copy-btn" onclick="event.preventDefault();copyMobileUID();" title="Copy ID">',
            '            <i class="fas fa-copy"></i>',
            '          </button>',
            '        </div>',
            '      </div>',
            '    </a>',
            '  </div>',
            '  <div class="mobile-header-actions">',
            '    <button class="mobile-hdr-btn" id="mobile-lang-trigger" onclick="toggleMobileLang()" title="Language">',
            '      <i class="fas fa-globe"></i>',
            '    </button>',
            '    <button class="mobile-hdr-btn" id="mobile-bell-btn" onclick="window._ylgBellToggle&&window._ylgBellToggle()" title="Notifications" style="position:relative;">',
            '      <i class="fas fa-bell"></i>',
            '      <span id="mobile-bell-dot" style="display:none;position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;background:#FF4444;pointer-events:none;"></span>',
            '    </button>',
            '    <a href="chat-user.html" class="mobile-hdr-btn" title="Live Support">',
            '      <i class="fas fa-headphones"></i>',
            '    </a>',
            '  </div>',
            '  <div class="mobile-lang-dropdown" id="mobile-lang-dropdown">',
            '    <div class="mlang-item" onclick="mobileChangeLang(\'en\')"><span>🇺🇸</span> English</div>',
            '    <div class="mlang-item" onclick="mobileChangeLang(\'mm\')"><span>🇲🇲</span> မြန်မာ</div>',
            '    <div class="mlang-item" onclick="mobileChangeLang(\'th\')"><span>🇹🇭</span> ไทย</div>',
            '  </div>',
            '</div>'
        ].join('\n');
    }

    function buildBottomNav(lang) {
        var l = lbl(lang);
        return [
            '<nav class="mobile-bottom-nav" id="mobile-bottom-nav">',
            '  <a href="index.html" class="mbn-item' + (isDash    ? ' active' : '') + '">',
            '    <i class="fas fa-home"></i>',
            '    <span id="mbn-dash">' + l.dash + '</span>',
            '  </a>',
            '  <a href="trading.html" class="mbn-item' + (isTrading ? ' active' : '') + '">',
            '    <i class="fas fa-chart-line"></i>',
            '    <span id="mbn-trade">' + l.trade + '</span>',
            '  </a>',
            '  <a href="wallet.html" class="mbn-item' + (isWallet  ? ' active' : '') + '">',
            '    <i class="fas fa-wallet"></i>',
            '    <span id="mbn-wall">' + l.wall + '</span>',
            '  </a>',
            '  <button class="mbn-item' + (isAccount ? ' active' : '') + '" onclick="toggleAssetsPanel()">',
            '    <i class="fas fa-user-circle"></i>',
            '    <span id="mbn-acct">' + l.acct + '</span>',
            '  </button>',
            '</nav>',

            '<div class="mobile-assets-overlay" id="assets-overlay" onclick="closeAssetsPanel()"></div>',

            '<div class="mobile-assets-panel" id="assets-panel">',
            '  <div class="assets-panel-handle"></div>',
            '  <div class="assets-panel-title" id="ap-title">' + l.panel + '</div>',
            '  <div class="assets-panel-list">',
            '    <a href="account.html"      class="assets-list-item"><i class="fas fa-user"></i><span id="ap-acct">' + l.acctItem + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="portfolio.html"    class="assets-list-item"><i class="fas fa-briefcase"></i><span id="ap-port">' + l.port + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="history.html"      class="assets-list-item"><i class="fas fa-history"></i><span id="ap-hist">' + l.hist + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="kyc.html"          class="assets-list-item"><i class="fas fa-user-check"></i><span id="ap-kyc">' + l.kyc + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="complaints.html"   class="assets-list-item"><i class="fas fa-flag"></i><span id="ap-comp">' + l.comp + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="faq.html"          class="assets-list-item"><i class="fas fa-question-circle"></i><span id="ap-faq">' + l.faq + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="chat-user.html"    class="assets-list-item"><i class="fas fa-headset"></i><span id="ap-sup">' + l.sup + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '    <a href="about.html"        class="assets-list-item"><i class="fas fa-info-circle"></i><span id="ap-about">' + l.about + '</span><i class="fas fa-chevron-right ap-arrow"></i></a>',
            '  </div>',
            '</div>'
        ].join('\n');
    }

    /* ── Label updater (after language change) ── */
    function applyMobileLabels(lang) {
        var l = lbl(lang);
        function s(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
        s('mbn-dash',  l.dash);
        s('mbn-trade', l.trade);
        s('mbn-wall',  l.wall);
        s('mbn-acct',  l.acct);
        s('ap-title',  l.panel);
        s('ap-acct',   l.acctItem);
        s('ap-port',   l.port);
        s('ap-hist',   l.hist);
        s('ap-kyc',    l.kyc);
        s('ap-comp',   l.comp);
        s('ap-faq',    l.faq);
        s('ap-sup',    l.sup);
        s('ap-about',  l.about);
    }

    /* ── User info display updater ── */
    function updateMobileUserInfo() {
        var name = getMemberName();
        var mid  = getMemberId();
        var section = document.getElementById('mobile-user-section');
        var nameEl  = document.getElementById('mobile-user-name');
        var midEl   = document.getElementById('mobile-uid-text');
        if (section) section.style.display = isLoggedIn() ? '' : 'none';
        if (nameEl) nameEl.textContent = name || 'YLG Member';
        if (midEl)  midEl.textContent  = mid;
    }

    /* ── Inject HTML when DOM is ready ── */
    function inject() {
        var lang = localStorage.getItem('selectedLang') || 'en';
        /* Top header — dashboard only */
        if (isDash && !document.getElementById('mobile-top-header')) {
            document.body.insertAdjacentHTML('afterbegin', buildTopHeader(lang));
            document.body.classList.add('has-mobile-header');
        }
        /* Bottom nav — all pages */
        if (!document.getElementById('mobile-bottom-nav')) {
            document.body.insertAdjacentHTML('beforeend', buildBottomNav(lang));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    /* ══════════════════════════════════════
       Global functions (called from onclick)
       ══════════════════════════════════════ */

    window.toggleAssetsPanel = function () {
        document.getElementById('assets-panel')?.classList.toggle('open');
        document.getElementById('assets-overlay')?.classList.toggle('open');
    };

    window.closeAssetsPanel = function () {
        document.getElementById('assets-panel')?.classList.remove('open');
        document.getElementById('assets-overlay')?.classList.remove('open');
    };

    window.toggleMobileLang = function () {
        document.getElementById('mobile-lang-dropdown')?.classList.toggle('open');
    };

    window.mobileChangeLang = function (lang) {
        localStorage.setItem('selectedLang', lang);
        document.getElementById('mobile-lang-dropdown')?.classList.remove('open');
        applyMobileLabels(lang);

        /* Call whatever language function this page uses */
        var fns = [
            'handleLangChange', 'applyLanguage',
            'applyChatLanguage', 'applyHistoryLanguage', 'applyKycLanguage',
            'applyWalletLanguage', 'applyPortfolioLanguage',
            'applyTradingLanguage', 'applyAccountLanguage', 'applyAboutLanguage', 'applyLang'
        ];
        for (var i = 0; i < fns.length; i++) {
            if (typeof window[fns[i]] === 'function') {
                try { window[fns[i]](lang); } catch (e) {}
                break;
            }
        }
    };

    window.copyMobileUID = function () {
        var mid = getMemberId();
        if (!mid || mid === '—') return;
        navigator.clipboard.writeText(mid).catch(function () {});
        var icon = document.querySelector('.mobile-copy-btn i');
        if (icon) {
            icon.className = 'fas fa-check';
            setTimeout(function () { icon.className = 'fas fa-copy'; }, 1200);
        }
    };

    /* ── Close lang dropdown on outside click ── */
    document.addEventListener('click', function (e) {
        if (!e.target.closest('#mobile-lang-trigger') &&
            !e.target.closest('#mobile-lang-dropdown')) {
            document.getElementById('mobile-lang-dropdown')?.classList.remove('open');
        }
    });

    /* ── Watch localStorage for user info / lang changes ── */
    var _origSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, val) {
        _origSet(key, val);
        if (key === 'memberId' || key === 'memberName' || key === 'userShortUID' || key === 'userName') updateMobileUserInfo();
        if (key === 'selectedLang') applyMobileLabels(val);
    };

    /* Cross-tab updates */
    window.addEventListener('storage', function (e) {
        if (e.key === 'memberId' || e.key === 'memberName' || e.key === 'userShortUID' || e.key === 'userName') updateMobileUserInfo();
        if (e.key === 'selectedLang') applyMobileLabels(e.newValue || 'en');
    });

})();
