
let currentGraphic = null;
let userPhotoData = null;

const TEMPLATE_CONFIG = {
    userPhoto: {
        x: 310,       
        y: 767,        
        width: 350,    
        height: 400,   
        style: 'rounded', 
        borderRadius: 30
    },
    userName: {
        x: 740,        
        y: 940,        
        font: 'bold 55px Poppins',
        color: '#000000',
        align: 'left',
        maxWidth: 400,
        maxHeight: 120,
        lineHeight: 65
    },
}

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupMobileOptimizations();
});

function initializeApp() {
    setupFileUpload();
    console.log('✅ Badge generator initialized');
}

function setupEventListeners() {
    const photoInput = document.getElementById('photo');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }

    const nameInput = document.getElementById('name');
    const roleInput = document.getElementById('role');
    
    if (nameInput) {
        nameInput.addEventListener('input', updatePreview);
    }
    
    if (roleInput) {
        roleInput.addEventListener('change', updatePreview);
    }
}

function setupFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const photoInput = document.getElementById('photo');
    
    if (fileUploadArea && photoInput) {
        fileUploadArea.addEventListener('click', () => {
            photoInput.click();
        });
        
        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });
        
        fileUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
        });
        
        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                photoInput.files = files;
                handlePhotoUpload({ target: { files: files } });
            }
        });
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    const photoPreview = document.getElementById('photo-preview');
    const fileUploadArea = document.getElementById('file-upload-area');
    
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Image file size should be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            userPhotoData = e.target.result;
            if (fileUploadArea) {
                fileUploadArea.style.display = 'none';
            }
            if (photoPreview) {
                photoPreview.style.display = 'block';
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`;
            }
            
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function updatePreview() {
    const name = document.getElementById('name').value.trim();
    const role = document.getElementById('role').value;
    
    currentGraphic = {
        name: name || 'Your Name',
        role: role || 'attendee',
        photo: userPhotoData
    };
    
    console.log('Preview updated:', currentGraphic);
}

function generateAndDownload() {
    const name = document.getElementById('name').value.trim();
    const role = document.getElementById('role').value;
    const photoFile = document.getElementById('photo').files[0];
    
    if (!name) {
        alert('Please enter your name');
        document.getElementById('name').focus();
        return;
    }
    
    currentGraphic = {
        name: name,
        role: role,
        photo: userPhotoData
    };
    
    console.log('Generating badge for:', currentGraphic);
    
    generateBadgeWithTemplate();
}

function generateBadgeWithTemplate() {
    const generateBtn = document.querySelector('.generate-btn');
    const originalText = generateBtn.innerHTML;
    
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Badge...';
    generateBtn.disabled = true;
    
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const templateImg = new Image();
        templateImg.onload = function() {
            canvas.width = templateImg.width;
            canvas.height = templateImg.height;
            
            console.log(`Canvas size: ${canvas.width}x${canvas.height}`);
            
            ctx.drawImage(templateImg, 0, 0);
            
            addUserDataToCanvas(ctx, canvas, function() {
                downloadCanvas(canvas);
                generateBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                generateBtn.style.background = '#10b981';
                generateBtn.disabled = false;
                
                setTimeout(() => {
                    generateBtn.innerHTML = originalText;
                    generateBtn.style.background = '';
                }, 2000);
            });
        };
        
        templateImg.onerror = function() {
            console.error('Failed to load template image');
            alert('Failed to load template. Please check if assets/template.jpg exists.');
            
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        };
        
        templateImg.src = 'assets/template.jpg';
        
    } catch (error) {
        console.error('Badge generation failed:', error);
        alert('Failed to generate badge. Please try again.');
        
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

function addUserDataToCanvas(ctx, canvas, callback) {
    let tasksCompleted = 0;
    const totalTasks = currentGraphic.photo ? 2 : 1; // Photo + Text or just Text
    
    function checkCompletion() {
        tasksCompleted++;
        if (tasksCompleted >= totalTasks) {
            callback();
        }
    }
    
    if (currentGraphic.photo) {
        const userImg = new Image();
        userImg.onload = function() {
            drawUserPhoto(ctx, userImg);
            checkCompletion();
        };
        userImg.onerror = function() {
            console.error('Failed to load user photo');
            checkCompletion();
        };
        userImg.src = currentGraphic.photo;
    }
    
    drawUserText(ctx);
    checkCompletion();
}

function drawUserPhoto(ctx, userImg) {
    const config = TEMPLATE_CONFIG.userPhoto;
    
    console.log(`Drawing photo at: x=${config.x}, y=${config.y}, size=${config.width}x${config.height}`);
    
    ctx.save();
    
    if (config.style === 'circle') {
        ctx.beginPath();
        ctx.arc(
            config.x + config.width / 2, 
            config.y + config.height / 2, 
            config.width / 2, 
            0, 
            2 * Math.PI
        );
        ctx.clip();
    } else if (config.style === 'rounded') {
        const radius = config.borderRadius || 20;
        ctx.beginPath();
        ctx.roundRect(config.x, config.y, config.width, config.height, radius);
        ctx.clip();
    } else {
        ctx.beginPath();
        ctx.rect(config.x, config.y, config.width, config.height);
        ctx.clip();
    }
    
    const scale = Math.max(config.width / userImg.width, config.height / userImg.height);
    const scaledWidth = userImg.width * scale;
    const scaledHeight = userImg.height * scale;
    
    const drawX = config.x + (config.width - scaledWidth) / 2;
    const drawY = config.y + (config.height - scaledHeight) / 2;
    
    ctx.drawImage(userImg, drawX, drawY, scaledWidth, scaledHeight);
    
    ctx.restore();
}

function drawUserText(ctx) {
    const nameConfig = TEMPLATE_CONFIG.userName;
    ctx.fillStyle = nameConfig.color;
    ctx.font = nameConfig.font;
    ctx.textAlign = nameConfig.align;
    
    console.log(`Drawing name "${currentGraphic.name}" at: x=${nameConfig.x}, y=${nameConfig.y}`);
    drawWrappedText(ctx, currentGraphic.name, nameConfig);
}

function drawWrappedText(ctx, text, config) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    ctx.font = config.font;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > config.maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    let y = config.y;
    for (let i = 0; i < lines.length; i++) {
        if (y > config.y + config.maxHeight) {
            break;
        }
        
        ctx.fillText(lines[i], config.x, y);
        y += config.lineHeight;
    }
}

function downloadCanvas(canvas) {
    try {
        const link = document.createElement('a');
        link.download = `blockfest-badge-${currentGraphic.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Badge downloaded successfully');
        
    } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download badge. Please try again.');
    }
}

function validateForm() {
    const name = document.getElementById('name').value.trim();
    
    if (!name) {
        alert('Please enter your name');
        return false;
    }
    
    return true;
}

function setupMobileOptimizations() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                }
            }
        });
        
        input.addEventListener('blur', function() {
            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                }
            }
        });
    });
    
    const generateBtn = document.querySelector('.generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        });
        
        generateBtn.addEventListener('touchend', function(e) {
            this.style.transform = '';
        });
    }
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn && !generateBtn.disabled) {
            generateAndDownload();
        }
    }
});

function debugPositions() {
    console.log('=== TEMPLATE CONFIGURATION ===');
    console.log('User Photo:', TEMPLATE_CONFIG.userPhoto);
    console.log('Top Name:', TEMPLATE_CONFIG.userName);
    console.log('Top Role:', TEMPLATE_CONFIG.userRole);
    console.log('Bottom Name:', TEMPLATE_CONFIG.bottomName);
    console.log('Bottom Role:', TEMPLATE_CONFIG.bottomRole);
    console.log('================================');
}

window.addEventListener('load', debugPositions);