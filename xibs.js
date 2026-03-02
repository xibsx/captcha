// xibs.js - FREEXIBS CAPTCHA Custom Element
// Works anywhere, CORS enabled

(function() {
    // Styles
    const styles = `
        .frexibs-container {
            position: relative;
            width: 100%;
            max-width: 450px;
            margin: 15px auto;
            background: linear-gradient(135deg, #0a0a0a, #1a1a2a);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0,255,100,0.3);
            padding: 20px;
            border: 1px solid #00ff66;
            font-family: 'Arial', sans-serif;
            box-sizing: border-box;
        }
        .frexibs-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(to right, #00ff66 1px, transparent 1px),
                linear-gradient(to bottom, #00ff66 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.05;
            pointer-events: none;
        }
        .frexibs-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        .human-btn {
            width: 100%;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #00ff66;
            background: transparent;
            border: 2px solid #00ff66;
            border-radius: 40px;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .human-btn:hover {
            background: #00ff66;
            color: black;
            box-shadow: 0 0 30px #00ff66;
        }
        .scanning {
            display: none;
            width: 100%;
            text-align: center;
        }
        .scan-line {
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00ff66, #cf30aa, transparent);
            animation: scanMove 2s linear infinite;
            margin: 15px 0;
        }
        .scan-text {
            color: #00ff66;
            font-size: 14px;
            margin: 10px 0;
        }
        .error-message {
            display: none;
            color: #ff3366;
            font-size: 14px;
            font-weight: bold;
            padding: 8px 16px;
            border: 2px solid #ff3366;
            border-radius: 30px;
            background: rgba(255,51,102,0.1);
            animation: errorPulse 1s;
        }
        .instruction {
            display: none;
            color: #00ff66;
            font-size: 13px;
            margin: 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .progress-counter {
            display: none;
            color: #888;
            font-size: 12px;
            margin: 5px 0;
        }
        .progress-counter span {
            color: #00ff66;
            font-weight: bold;
        }
        .emoji-grid {
            display: none;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
            margin: 10px 0;
        }
        .emoji-btn {
            aspect-ratio: 1;
            background: rgba(0,255,100,0.1);
            border: 2px solid #00ff66;
            border-radius: 12px;
            font-size: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 0 10px rgba(0,255,100,0.2);
        }
        .emoji-btn:hover {
            background: #00ff66;
            transform: scale(1.05);
            box-shadow: 0 0 20px #00ff66;
        }
        .emoji-btn.correct {
            background: #00ff66;
            animation: correct 0.3s;
        }
        .verified-message {
            display: none;
            text-align: center;
            color: #00ff66;
            font-size: 24px;
            font-weight: bold;
            margin: 15px 0;
            animation: verifiedPop 0.5s;
        }
        .verified-message a {
            color: #cf30aa;
            text-decoration: none;
            font-size: 12px;
            display: block;
            margin-top: 8px;
        }
        .branding {
            margin-top: 10px;
            color: #444;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-top: 1px solid #222;
            padding-top: 10px;
            width: 100%;
        }
        .branding span {
            color: #00ff66;
            font-weight: bold;
        }
        @keyframes scanMove {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        @keyframes correct {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        @keyframes errorPulse {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes verifiedPop {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;

    // Emoji lists
    const emotions = ['😊', '😂', '😭', '😉', '😍', '😎', '🥺', '😡', '🥳', '😱', '🤯', '🥴'];
    const objects = ['🌍', '🍍', '🍉', '🥭', '🍇', '🫐', '🍆', '🍋', '🍊', '🍎', '🚗', '📱', '💻', '⌚', '⚽', '🏀'];

    // Add styles to page
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Add Font Awesome
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fa);

    // Custom Element
    class XIBSElement extends HTMLElement {
        constructor() {
            super();
            this.verified = false;
            this.attempts = 0;
        }

        connectedCallback() {
            this.render();
            this.setupEventListeners();
            this.findParentForm();
        }

        render() {
            this.innerHTML = `
                <div class="frexibs-container">
                    <div class="frexibs-content">
                        <button class="human-btn" id="humanBtn-${this.generateId()}">
                            <i class="fas fa-user"></i>
                            I'M HUMAN
                            <i class="fas fa-arrow-right"></i>
                        </button>

                        <div class="scanning" id="scanning-${this.generateId()}">
                            <div class="scan-line"></div>
                            <div class="scan-text">
                                <i class="fas fa-circle-notch fa-spin"></i> ANALYZING <i class="fas fa-circle-notch fa-spin"></i>
                            </div>
                        </div>

                        <div class="error-message" id="error-${this.generateId()}">
                            <i class="fas fa-exclamation-triangle"></i>
                            WRONG! TRY AGAIN
                            <i class="fas fa-redo-alt"></i>
                        </div>

                        <div class="instruction" id="instruction-${this.generateId()}">
                            <i class="fas fa-hand-pointer"></i> TAP ALL HUMAN EMOTIONS
                        </div>

                        <div class="progress-counter" id="progress-${this.generateId()}">
                            <span id="correct-${this.generateId()}">0</span> / <span id="total-${this.generateId()}">3</span> found
                        </div>

                        <div class="emoji-grid" id="grid-${this.generateId()}"></div>

                        <div class="verified-message" id="verified-${this.generateId()}">
                            <i class="fas fa-check-circle"></i> HUMAN VERIFIED
                            <a href="https://captcha.xibs.space" target="_blank">meet us on xibs.space</a>
                        </div>

                        <div class="branding">
                            <i class="fas fa-bolt"></i>
                            <span>FREEXIBS</span> CAPTCHA
                            <i class="fas fa-shield"></i>
                        </div>
                    </div>
                </div>
            `;
        }

        generateId() {
            return Math.random().toString(36).substr(2, 9);
        }

        setupEventListeners() {
            const id = this.querySelector('[id^="humanBtn-"]').id.split('-')[1];
            
            document.getElementById(`humanBtn-${id}`).onclick = () => this.startVerification(id);
        }

        startVerification(id) {
            document.getElementById(`humanBtn-${id}`).style.display = 'none';
            document.getElementById(`scanning-${id}`).style.display = 'block';
            
            setTimeout(() => {
                document.getElementById(`scanning-${id}`).style.display = 'none';
                this.showEmojiChallenge(id);
            }, 2000);
        }

        showEmojiChallenge(id) {
            document.getElementById(`instruction-${id}`).style.display = 'block';
            document.getElementById(`progress-${id}`).style.display = 'block';
            
            const grid = document.getElementById(`grid-${id}`);
            grid.style.display = 'grid';
            
            // Random emotions (3-4)
            const shuffledEmotions = [...emotions].sort(() => 0.5 - Math.random());
            const selectedEmotions = shuffledEmotions.slice(0, Math.floor(Math.random() * 2) + 3);
            
            // Fill with objects
            const shuffledObjects = [...objects].sort(() => 0.5 - Math.random());
            const selectedObjects = shuffledObjects.slice(0, 9 - selectedEmotions.length);
            
            // Combine and shuffle
            const allEmojis = [...selectedEmotions, ...selectedObjects];
            for (let i = allEmojis.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allEmojis[i], allEmojis[j]] = [allEmojis[j], allEmojis[i]];
            }
            
            // Store in element dataset
            this.dataset.emotions = JSON.stringify(selectedEmotions);
            this.dataset.found = JSON.stringify([]);
            this.dataset.total = selectedEmotions.length;
            
            document.getElementById(`total-${id}`).textContent = selectedEmotions.length;
            document.getElementById(`correct-${id}`).textContent = '0';
            
            grid.innerHTML = '';
            allEmojis.forEach(emoji => {
                const btn = document.createElement('div');
                btn.className = 'emoji-btn';
                btn.textContent = emoji;
                btn.onclick = () => this.checkEmoji(emoji, btn, id);
                grid.appendChild(btn);
            });
        }

        checkEmoji(emoji, btn, id) {
            const emotions = JSON.parse(this.dataset.emotions);
            const found = JSON.parse(this.dataset.found || '[]');
            
            if (emotions.includes(emoji) && !found.includes(emoji)) {
                // Correct
                btn.classList.add('correct');
                found.push(emoji);
                this.dataset.found = JSON.stringify(found);
                
                document.getElementById(`correct-${id}`).textContent = found.length;
                
                if (found.length === emotions.length) {
                    setTimeout(() => {
                        document.getElementById(`instruction-${id}`).style.display = 'none';
                        document.getElementById(`progress-${id}`).style.display = 'none';
                        document.getElementById(`grid-${id}`).style.display = 'none';
                        document.getElementById(`error-${id}`).style.display = 'none';
                        document.getElementById(`verified-${id}`).style.display = 'block';
                        
                        this.verified = true;
                        window.frexibsVerified = true;
                        
                        // Re-enable form submit
                        if (this.parentForm) {
                            const submitBtn = this.parentForm.querySelector('button[type="submit"], input[type="submit"]');
                            if (submitBtn) submitBtn.disabled = false;
                        }
                    }, 500);
                }
            } else if (emotions.includes(emoji) && found.includes(emoji)) {
                return;
            } else {
                // Wrong
                this.showError(id);
            }
        }

        showError(id) {
            const error = document.getElementById(`error-${id}`);
            error.style.display = 'flex';
            
            // Disable buttons
            const buttons = document.querySelectorAll(`#grid-${id} .emoji-btn`);
            buttons.forEach(btn => btn.style.pointerEvents = 'none');
            
            setTimeout(() => {
                error.style.display = 'none';
                this.showEmojiChallenge(id);
                buttons.forEach(btn => btn.style.pointerEvents = 'auto');
            }, 2000);
        }

        findParentForm() {
            this.parentForm = this.closest('form');
            if (this.parentForm) {
                // Disable submit button
                const submitBtn = this.parentForm.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) submitBtn.disabled = true;
                
                // Block form submission
                this.parentForm.addEventListener('submit', (e) => {
                    if (!this.verified && !window.frexibsVerified) {
                        e.preventDefault();
                        this.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        }
    }

    // Register custom element
    customElements.define('xibs', XIBSElement);

    // Global verified flag
    window.frexibsVerified = false;

    // Auto-protect all forms with xibs
    document.addEventListener('DOMContentLoaded', () => {
        // Any additional setup
        console.log('✅ FREEXIBS CAPTCHA loaded - Ready to protect forms!');
    });

})();