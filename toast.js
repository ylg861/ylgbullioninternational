/* ═══════════════════════════════════════════
   toast.js — YLG Bullion
   Global toast notification system.
   Usage:  showToast('Message')
           showToast('Message', 'success')   // success | error | warning | info
           showToast('Message', 'error', 4000)
   ═══════════════════════════════════════════ */
(function () {

    /* Inject styles once */
    if (!document.getElementById('ylg-toast-style')) {
        var s = document.createElement('style');
        s.id = 'ylg-toast-style';
        s.textContent = [
            '#ylg-toast-wrap{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;}',
            '.ylg-toast{display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:600;color:#fff;min-width:200px;max-width:320px;box-shadow:0 8px 28px rgba(0,0,0,0.5);pointer-events:none;opacity:0;transform:translateY(16px) scale(0.95);transition:opacity .22s ease,transform .22s ease;border:1px solid rgba(255,255,255,0.08);}',
            '.ylg-toast.show{opacity:1;transform:translateY(0) scale(1);}',
            '.ylg-toast.hide{opacity:0;transform:translateY(10px) scale(0.95);}',
            '.ylg-toast-success{background:linear-gradient(135deg,#1a3d26,#0d2718);border-color:rgba(0,176,80,0.35);}',
            '.ylg-toast-error{background:linear-gradient(135deg,#3d1a1a,#270d0d);border-color:rgba(217,48,37,0.35);}',
            '.ylg-toast-warning{background:linear-gradient(135deg,#3d2e0d,#271e06);border-color:rgba(255,193,7,0.35);}',
            '.ylg-toast-info{background:linear-gradient(135deg,#0d2235,#081525);border-color:rgba(33,150,243,0.35);}',
            '.ylg-toast-icon{font-size:16px;flex-shrink:0;}',
            '@media(max-width:480px){#ylg-toast-wrap{bottom:72px;width:calc(100% - 32px);}.ylg-toast{min-width:0;width:100%;max-width:100%;}}'
        ].join('');
        (document.head || document.documentElement).appendChild(s);
    }

    /* Create container */
    function getWrap() {
        var w = document.getElementById('ylg-toast-wrap');
        if (!w) {
            w = document.createElement('div');
            w.id = 'ylg-toast-wrap';
            document.body.appendChild(w);
        }
        return w;
    }

    var ICONS = {
        success: '<i class="fas fa-check-circle" style="color:#00B050;"></i>',
        error:   '<i class="fas fa-times-circle" style="color:#FF6B6B;"></i>',
        warning: '<i class="fas fa-exclamation-triangle" style="color:#FFC107;"></i>',
        info:    '<i class="fas fa-info-circle" style="color:#42A5F5;"></i>'
    };

    window.showToast = function (msg, type, duration) {
        type     = type     || 'info';
        duration = duration || 3000;

        var wrap  = getWrap();
        var toast = document.createElement('div');
        toast.className = 'ylg-toast ylg-toast-' + type;
        toast.innerHTML = (ICONS[type] || ICONS.info) +
            '<span class="ylg-toast-icon"></span>' +
            '<span>' + msg + '</span>';

        wrap.appendChild(toast);

        /* Animate in */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { toast.classList.add('show'); });
        });

        /* Animate out + remove */
        setTimeout(function () {
            toast.classList.add('hide');
            toast.classList.remove('show');
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    };

})();
