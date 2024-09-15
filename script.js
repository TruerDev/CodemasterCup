const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const fileNameDisplay = document.getElementById('fileName');
const tryAgainButton = document.getElementById('tryAgainButton');
const previewImage = document.getElementById('previewImage');
const previewImg = document.getElementById('previewImg');
const imageName = document.getElementById('imageName');
const editWindow = document.getElementById('editWindow');
const startEditingButton = document.getElementById('startEditingButton');
const closeEditButton = document.getElementById('closeEditButton');
const inspectorContent = document.getElementById('inspectorContent');
const elementsButton = document.getElementById('elementsButton');
const elementsDropdown = document.getElementById('elementsDropdown');
const editableImage = document.getElementById('editableImage');
const saveImageButton = document.getElementById('saveButton');

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/png'];

let globalImageSrc = '';
let brightness = 100;
let contrast = 100;
let saturation = 100;
let grayscale = 0;
let sepia = 0;

let originalImageSrc = '';

let rotateAngle = 0, flipHorizontal = 1, flipVertical = 1;
let imageType = "";

uploadBox.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));

document.getElementById('replaceImageButton').addEventListener('click', () => {
    fileInput.click();
});
document.getElementById('deleteImageButton').addEventListener('click', () => {
    previewImg.classList.add('hidden');
    previewImg.classList.add('display-none');
    uploadBox.classList.remove('hidden');
    uploadBox.classList.remove('display-none');
    previewImage.src = ''; 
    fileInput.value = ''; 
});
elementsButton.addEventListener('click', (event) => {
    event.stopPropagation();

    const buttonRect = elementsButton.getBoundingClientRect();
    
    elementsDropdown.style.top = `${buttonRect.bottom + window.scrollY}px`; 
    elementsDropdown.style.left = `${buttonRect.left + window.scrollX}px`;

    elementsDropdown.classList.toggle('hidden');
    elementsDropdown.classList.toggle('visible');
});
document.addEventListener('click', (event) => {
    if (!elementsButton.contains(event.target) && !elementsDropdown.contains(event.target)) {
        elementsDropdown.classList.remove('visible');
        elementsDropdown.classList.add('hidden');
    }
});
const elementButtons = document.querySelectorAll('.dropdown-button');
elementButtons.forEach(button => {
    button.addEventListener('click', () => {
        const toolName = button.querySelector('span').textContent;
        console.log(`Вы выбрали инструмент: ${toolName}`);
    });
});
startEditingButton.addEventListener('click', () => {
    editWindow.classList.remove('hidden');
    editWindow.classList.add('visible');
});
closeEditButton.addEventListener('click', () => {
    editWindow.classList.remove('visible');
    editWindow.classList.add('hidden');
});
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', handleDrop);
tryAgainButton.addEventListener('click', resetUpload);
const saveImage = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = editableImage.naturalWidth;
    canvas.height = editableImage.naturalHeight;
    context.filter = `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
    context.translate(canvas.width / 2, canvas.height / 2);
    if(rotateAngle !== 0)
        context.rotate(rotateAngle * Math.PI / 180); 
    context.scale(flipHorizontal, flipVertical);
    context.drawImage(editableImage, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = "edited image"+imageType;
    link.href = canvas.toDataURL();
    link.click();
}
saveImageButton.addEventListener('click', saveImage)


function resetUpload() {
    fadeOut(errorContainer, () => {
        fadeIn(uploadBox);
        hideLoader(); 
    });
    fileInput.value = ''; 
}

function fadeOut(element, callback) {
    element.classList.add('hidden');
    setTimeout(() => {
        element.classList.add('display-none');
        if (callback) callback();
    }, 500);
}

function fadeIn(element, callback) {
    element.classList.remove('display-none');
    setTimeout(() => {
        element.classList.remove('hidden');
        if (callback) callback();
    }, 10);
}

function showLoader(fileName) {
    document.getElementById('loaderText').textContent = `File name ${fileName} is loading`;
    fadeIn(document.getElementById('loader'));
}

function hideLoader() {
    fadeOut(document.getElementById('loader'));
}

function handleFile(file) {
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
        showError('Invalid file type. Please upload JPEG or PNG.', file.name);
    } else if (file.size > MAX_SIZE_BYTES) {
        showError(`File size exceeds ${MAX_SIZE_MB}MB limit.`, file.name);
    } else {
        showLoader(file.name);
        imageType = file.type;
        if(imageType === "image/png")
            imageType = ".png";
        else
            imageType = ".jpg";
        
        const imageSrc = URL.createObjectURL(file);

        globalImageSrc = imageSrc;
        originalImageSrc = imageSrc;

        console.log('Загруженный файл:', file);
        console.log('Путь к изображению:', globalImageSrc);

        previewImage.src = URL.createObjectURL(file);
        editableImage.src = URL.createObjectURL(file);
        previewImage.onload = () => {
            URL.revokeObjectURL(previewImage.src);
            URL.revokeObjectURL(editableImage.src);

            setTimeout(() => {
                fadeOut(uploadBox, () => {
                    fadeIn(previewImg);
                    hideLoader();
                });
            }, 600);
            URL.revokeObjectURL(imageSrc.src);
        };
    }
}

function showError(message, fileName) {
    errorMessage.textContent = message;
    fileNameDisplay.textContent = `File: ${fileName}`;

    fadeOut(previewImg, () => {
        fadeIn(errorContainer);
        hideLoader();
    });

    fadeOut(uploadBox, () => {
        fadeIn(errorContainer);
        hideLoader();
    });
}

function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleFile(file);
}

document.getElementById('cropButton').addEventListener('click', showCropParams);
document.getElementById('resizeButton').addEventListener('click', showResizeParams);
document.getElementById('RotateFlipButton').addEventListener('click', showRotateFlipParams);
document.getElementById('adjustButton').addEventListener('click', showAdjustParams);
document.getElementById('filtersButton').addEventListener('click', showFiltersParams);

let cropRatio = '1:1';

function showCropParams() {
    inspectorContent.innerHTML = `
        <div class="tool-params crop-params">
            <label for="cropRatio">Crop ratio</label>
            <select id="cropRatio">
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="4:3">4:3</option>
            </select>
        </div>
    `;

    document.getElementById('cropRatio').addEventListener('change', (event) => {
        cropRatio = event.target.value;
        cropImage();
    });
}

function cropImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = editableImage;

    const [ratioWidth, ratioHeight] = cropRatio.split(':').map(Number);

    const imageAspectRatio = image.naturalWidth / image.naturalHeight;
    let cropWidth, cropHeight;

    if (imageAspectRatio > ratioWidth / ratioHeight) {
        cropHeight = image.naturalHeight;
        cropWidth = cropHeight * (ratioWidth / ratioHeight);
    } else {
        cropWidth = image.naturalWidth;
        cropHeight = cropWidth / (ratioWidth / ratioHeight);
    }

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    context.drawImage(
        image,
        (image.naturalWidth - cropWidth) / 2,
        (image.naturalHeight - cropHeight) / 2,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
    );

    editableImage.src = canvas.toDataURL();
}


function showResizeParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params resize-params">
        <label for="widthInput">Width (px)</label>
        <input type="text" id="widthInput">
        
        <label for="heightInput">Height (px)</label>
        <input type="text" id="heightInput">

        <label for="constrainProportions">
            <input type="checkbox" id="constrainProportions"> Constrain proportions
        </label>
    </div>
    `;

    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const constrainProportionsCheckbox = document.getElementById('constrainProportions');

    const maxWidth = editableImage.naturalWidth;
    const maxHeight = editableImage.naturalHeight;
    widthInput.value = maxWidth;
    heightInput.value = maxHeight;

    const aspectRatio = maxWidth / maxHeight;

    widthInput.setAttribute('max', maxWidth);
    heightInput.setAttribute('max', maxHeight);

    widthInput.addEventListener('input', () => {
        if (parseInt(widthInput.value, 10) > maxWidth) {
            widthInput.value = maxWidth;
        }

        if (constrainProportionsCheckbox.checked) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
        resizeImage();
    });

    heightInput.addEventListener('input', () => {
        if (parseInt(heightInput.value, 10) > maxHeight) {
            heightInput.value = maxHeight;
        }

        if (constrainProportionsCheckbox.checked) {
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
        resizeImage();
    });

    constrainProportionsCheckbox.addEventListener('change', () => {
        if (constrainProportionsCheckbox.checked) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
    });

    function resizeImage() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = widthInput.value;
        canvas.height = heightInput.value;

        context.drawImage(editableImage, 0, 0, canvas.width, canvas.height);

        editableImage.src = canvas.toDataURL();
    }
}




function showRotateFlipParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params rotate-flip-params">
        <!-- Надпись Rotate -->
        <label>Rotate</label>
        <div class="button-group">
            <button id="rotateLeftButton">
                <img src="icons/rotate-left.png" alt="Rotate Left">
            </button>
            <button id="rotateRightButton">
                <img src="icons/rotate-right.png" alt="Rotate Right">
            </button>
        </div>

        <!-- Надпись Flip -->
        <label>Flip</label>
        <div class="button-group">
            <button id="flipHorizontalButton">
                <img src="icons/flip-horizontal.png" alt="Flip Horizontal">
            </button>
            <button id="flipVerticalButton">
                <img src="icons/flip-vertical.png" alt="Flip Vertical">
            </button>
        </div>
    </div>
    `;

    const rotateFlipButtons = document.querySelectorAll('.rotate-flip-params button');

    rotateFlipButtons.forEach(button => {
        button.addEventListener("click", () => {
            if(button.id === "rotateLeftButton") {
                rotateAngle -= 90;
            } else if(button.id === "rotateRightButton") {
                rotateAngle += 90;
            } else if(button.id === "flipHorizontalButton") {
                flipHorizontal = flipHorizontal === 1 ? -1 : 1;
            } else if(button.id === "flipVerticalButton") {
                flipVertical = flipVertical === 1 ? -1 : 1;
            }
            applyFilters();
        })
    })
}

function showAdjustParams() {
    inspectorContent.innerHTML = `
    <div class="tool-params adjust-params">
        <label for="brightness">Brightness</label>
        <input type="range" id="brightness" min="0" max="200" value="${brightness}">
        
        <label for="contrast">Contrast</label>
        <input type="range" id="contrast" min="0" max="200" value="${contrast}">
        
        <label for="saturation">Saturation</label>
        <input type="range" id="saturation" min="0" max="200" value="${saturation}">
        
        <label for="grayscale">Grayscale</label>
        <input type="range" id="grayscale" min="0" max="100" value="${grayscale}">

        <label for="sepia">Sepia</label>
        <input type="range" id="sepia" min="0" max="100" value="${sepia}">
    </div>
    `;

    const sliders = document.querySelectorAll('.adjust-params input[type="range"]');
    sliders.forEach(slider => {
        updateSliderBackground(slider); 

        slider.addEventListener('input', function () {
            updateSliderBackground(slider);
            
            if (slider.id === 'brightness') {
                brightness = slider.value;
            } else if (slider.id === 'contrast') {
                contrast = slider.value;
            } else if (slider.id === 'saturation') {
                saturation = slider.value;
            } else if (slider.id === 'grayscale') {
                grayscale = slider.value;
            } else if (slider.id === 'sepia') {
                sepia = slider.value;
            }
            applyFilters();
        });
    });
}

function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #33aada ${value}%, #ccc ${value}%)`;
}

const applyFilters = () => {
    editableImage.style.transform = `rotate(${rotateAngle}deg) scale(${flipHorizontal}, ${flipVertical})`;
    editableImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
};

function showFiltersParams() {
    if (!globalImageSrc) {
        console.error('Путь к изображению не определён');
        return;
    }

    inspectorContent.innerHTML = `
    <div class="tool-params filters-params">
        <!-- Первая строка с кнопками и подписями -->
        <div class="filter-row">
            <div class="filter-group">
                <button id="filterNone" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="None" class="filter-preview" id="previewNone">
                    </div>
                </button>
                <span>None</span>
            </div>
            <div class="filter-group">
                <button id="filterBW" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="Black & White" class="filter-preview" id="previewBW">
                    </div>
                </button>
                <span>Black&<br>White</span>
            </div>
        </div>

        <!-- Вторая строка с кнопками и подписями -->
        <div class="filter-row">
            <div class="filter-group">
                <button id="filterSepia" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="Sepia" class="filter-preview" id="previewSepia">
                    </div>
                </button>
                <span>Sepia</span>
            </div>
            <div class="filter-group">
                <button id="filterVintage" class="filter-button">
                    <div class="img-wrapper">
                        <img src="${globalImageSrc}" alt="Vintage" class="filter-preview" id="previewVintage">
                    </div>
                </button>
                <span>Vintage</span>
            </div>
        </div>
    </div>
    `;

    applyFiltersForExamples();

    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));

            button.classList.add('active');

            const filterId = event.currentTarget.id;
            applySelectedFilter(filterId);
        });
    });
}

function applySelectedFilter(filterId) {
    if (filterId === 'filterNone') {
        brightness = 100, saturation = 100, contrast = 100, grayscale = 0, sepia = 0;
    } else if (filterId === 'filterBW') {
        brightness = 100, saturation = 100, contrast = 100, grayscale = 100, sepia = 0;
    } else if (filterId === 'filterSepia') {
        brightness = 100, saturation = 100, contrast = 100, grayscale = 100, sepia = 100;
    } else if (filterId === 'filterVintage') {
        brightness = 100, saturation = 70, contrast = 120, grayscale = 0, sepia = 0;
    }
    applyFilters();
}

function applyFiltersForExamples() {
    document.getElementById('previewBW').style.filter = 'grayscale(100%)';
    document.getElementById('previewSepia').style.filter = 'sepia(100%)';
    document.getElementById('previewVintage').style.filter = 'contrast(120%) saturate(70%)';
}


document.getElementById('revertButton').addEventListener('click', () => {
    if (globalImageSrc) {
        editableImage.src = globalImageSrc;

        console.log(globalImageSrc);
        console.log(editableImage.src);
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();
        image.src = globalImageSrc;

        image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            context.drawImage(image, 0,0, canvas.width, canvas.height);

            editableImage.src = canvas.toDataURL();
        };
    }
});