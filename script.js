// script.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    // 1. ローカルストレージから設定を読み込む
    const currentTheme = localStorage.getItem('theme');

    // 保存されたテーマがあれば適用（ボタンの有無に関わらず実行）
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    // 2. ボタンが存在する場合のみ、イベントを設定（ここが安全装置）
    if (toggleButton) {
        // アイコンの初期表示設定
        if (currentTheme === 'dark') {
            toggleButton.textContent = '☀️';
        } else {
            toggleButton.textContent = '🌙';
        }

        // クリック時の処理
        toggleButton.addEventListener('click', () => {
            // dark-modeクラスをトグル
            body.classList.toggle('dark-mode');

            // 現在の状態を確認して保存
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                toggleButton.textContent = '☀️';
            } else {
                localStorage.setItem('theme', 'light');
                toggleButton.textContent = '🌙';
            }
        });
    }
});