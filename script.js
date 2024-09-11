// Константы и элементы DOM
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

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/png'];

// Загрузка изображения по нажатию
uploadBox.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));

// Изменить выбранное изображение
document.getElementById('replaceImageButton').addEventListener('click', () => {
    fileInput.click();
});

// Удаление изображения и возврат на начальный экран
document.getElementById('deleteImageButton').addEventListener('click', () => {
    previewImg.classList.add('hidden');
    previewImg.classList.add('display-none');
    uploadBox.classList.remove('hidden');
    uploadBox.classList.remove('display-none');
    previewImage.src = ''; // Очищаем изображение
    fileInput.value = ''; // Очищаем поле выбора файла
});

// Показываем или скрываем выпадающий список при нажатии (окно изменения)
elementsButton.addEventListener('click', () => {
    elementsDropdown.classList.toggle('hidden');
});

// Скрываем выпадающий список, если щелкнули вне его (окно изменения)
document.addEventListener('click', (event) => {
    if (!elementsButton.contains(event.target) && !elementsDropdown.contains(event.target)) {
        elementsDropdown.classList.add('hidden');
    }
});

// Показ окна редактирования
startEditingButton.addEventListener('click', () => {
    editWindow.classList.remove('hidden');
    editWindow.classList.add('visible');
});

// Закрытие окна редактирования
closeEditButton.addEventListener('click', () => {
    editWindow.classList.remove('visible');
    editWindow.classList.add('hidden');
});


// Оптимизированный drag-and-drop обработчик
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', handleDrop);

// Кнопка "Попробовать снова" при ошибке
tryAgainButton.addEventListener('click', resetUpload);

// Функция сброса состояния
function resetUpload() {
    fadeOut(errorContainer, () => {
        fadeIn(uploadBox);
        hideLoader(); // Скрываем loader при отображении ошибки
    });
    fileInput.value = ''; // Очистка выбранного файла
}

// Функция скрытия с плавной анимацией
function fadeOut(element, callback) {
    element.classList.add('hidden');
    setTimeout(() => {
        element.classList.add('display-none');
        if (callback) callback();
    }, 500);
}

// Функция показа с плавной анимацией
function fadeIn(element, callback) {
    element.classList.remove('display-none');
    setTimeout(() => {
        element.classList.remove('hidden');
        if (callback) callback();
    }, 10);
}

// Функция показа анимации загрузки
function showLoader(fileName) {
    document.getElementById('loaderText').textContent = `File name ${fileName} is loading`;
    fadeIn(document.getElementById('loader'));
}

// Функция скрытия анимации загрузки
function hideLoader() {
    fadeOut(document.getElementById('loader'));
}

// Функция обработки файла
function handleFile(file) {
    if (!file) return;

    if (!VALID_TYPES.includes(file.type)) {
        showError('Invalid file type. Please upload JPEG or PNG.', file.name);
    } else if (file.size > MAX_SIZE_BYTES) {
        showError(`File size exceeds ${MAX_SIZE_MB}MB limit.`, file.name);
    } else {
        // Показываем анимацию загрузки
        showLoader(file.name);

        previewImage.src = URL.createObjectURL(file);
        editableImage.src = URL.createObjectURL(file);
        previewImage.onload = () => {
            URL.revokeObjectURL(previewImage.src); // Освобождаем память после загрузки
            URL.revokeObjectURL(editableImage.src);

            // Переход к режиму предпросмотра с плавной анимацией
            setTimeout(() => {
                fadeOut(uploadBox, () => {
                    fadeIn(previewImg);
                    hideLoader(); // Скрываем loader только после загрузки и показа предпросмотра
                });
            }, 1000); // Время задержки для симуляции загрузки
        };
    }
}

// Функция отображения ошибки
function showError(message, fileName) {
    errorMessage.textContent = message;
    fileNameDisplay.textContent = `File: ${fileName}`;

    fadeOut(previewImg, () => {
        fadeIn(errorContainer);
        hideLoader(); // Скрываем loader при отображении ошибки
    });

    fadeOut(uploadBox, () => {
        fadeIn(errorContainer);
        hideLoader(); // Скрываем loader при отображении ошибки
    });
}

// Функция обработки dragover
function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add('dragover');
}

// Функция обработки события drop
function handleDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = event.dataTransfer.files[0];
    handleFile(file);
}

// Опциональная функция для работы с несколькими файлами
function handleMultipleFiles(files) {
    if (files.length > 1) {
        showError('Please upload only one file at a time.', '');
    } else {
        handleFile(files[0]);
    }
}

// Функции для отображения параметров инструментов
document.getElementById('cropButton').addEventListener('click', showCropParams);
document.getElementById('resizeButton').addEventListener('click', showResizeParams);
document.getElementById('RotateFlipButton').addEventListener('click', showRotateFlipParams);
document.getElementById('adjustButton').addEventListener('click', showAdjustParams);
document.getElementById('filtersButton').addEventListener('click', showFiltersParams);

function showCropParams() {
    inspectorContent.innerHTML = `
        <label for="cropRatio">Crop Ratio</label>
        <select id="cropRatio">
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
        </select>
    `;
}

function showResizeParams() {
    inspectorContent.innerHTML = `
        <label for="widthInput">Width (px)</label>
        <input type="number" id="widthInput">
        
        <label for="heightInput">Height (px)</label>
        <input type="number" id="heightInput">
        
        <label for="constrainProportions">
            <input type="checkbox" id="constrainProportions"> Constrain proportions
        </label>
    `;
}

function showRotateFlipParams() {
    inspectorContent.innerHTML = `
        <label>Rotate</label>
        <button id="rotateLeftButton">Rotate Left</button>
        <button id="rotateRightButton">Rotate Right</button>
        
        <label>Flip</label>
        <button id="flipHorizontalButton">Flip Horizontal</button>
        <button id="flipVerticalButton">Flip Vertical</button>
    `;
}

function showAdjustParams() {
    inspectorContent.innerHTML = `
        <label for="brightness">Brightness</label>
        <input type="range" id="brightness" min="0" max="200" value="100">
        
        <label for="contrast">Contrast</label>
        <input type="range" id="contrast" min="0" max="200" value="100">
        
        <label for="saturation">Saturation</label>
        <input type="range" id="saturation" min="0" max="200" value="100">
        
        <label for="exposition">Exposition</label>
        <input type="range" id="exposition" min="0" max="200" value="100">
    `;
}

function showFiltersParams() {
    inspectorContent.innerHTML = `
        <button id="filterNone">None</button>
        <button id="filterBW">Black & White</button>
        <button id="filterSepia">Sepia</button>
        <button id="filterVintage">Vintage</button>
    `;
}
