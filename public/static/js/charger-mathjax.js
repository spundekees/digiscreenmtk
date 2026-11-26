window.MathJax = {
	options: {
		enableMenu: false
	},
    tex: {
        inlineMath: [
            ['\\(', '\\)']
        ],
        displayMath: [
            ['$$', '$$'],
            ['\\[', '\\]']
        ]
    }
};

// MathJax wird vom eigenen Server geladen (kein externes CDN, Datenschutz) – und erst,
// wenn auf der Seite wirklich eine Formel steht (Medienzentrum MTK).
var mathjaxSkript = document.currentScript && document.currentScript.src ? document.currentScript.src : '';
var mathjaxQuelle = mathjaxSkript && /static\/js\/charger-mathjax\.js/.test(mathjaxSkript)
    ? mathjaxSkript.replace(/js\/charger-mathjax\.js.*$/, 'mathjax/tex-chtml.js')
    // Als einzelne HTML-Datei exportierte Tafeln haben keinen eigenen Server: nur dort das CDN als Rückfall
    : 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js';
var mathjaxLaedt = false;

window.chargerMathJax = function () {
    if (mathjaxLaedt) {
        return;
    }
    mathjaxLaedt = true;
    var script = document.createElement('script');
    script.src = mathjaxQuelle;
    script.async = true;
    document.head.appendChild(script);
};

window.typesetMathJax = function () {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    } else if (document.body && /\\\(|\\\[|\$\$/.test(document.body.textContent || '')) {
        window.chargerMathJax();
    }
};
